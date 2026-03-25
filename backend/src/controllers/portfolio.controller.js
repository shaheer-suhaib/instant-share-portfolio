const { randomBytes } = require('crypto');
const pool = require('../config/db');

// Generates an 8-character hex code (4 billion combinations, collision-safe at our scale)
const generateCode = () => randomBytes(4).toString('hex');

// Ensures uniqueness — retries up to 5 times on the rare collision
const getUniqueCode = async (client) => {
  for (let i = 0; i < 5; i++) {
    const code = generateCode();
    const { rows } = await client.query('SELECT id FROM portfolios WHERE code = $1', [code]);
    if (rows.length === 0) return code;
  }
  throw new Error('Could not generate a unique code. Please try again.');
};

// ── Helper: insert all child records inside a transaction ────────────────────
const insertChildren = async (client, portfolioId, { skills, services, social_links, projects }) => {
  // Skills
  for (let i = 0; i < skills.length; i++) {
    const { name, level, category } = skills[i];
    await client.query(
      `INSERT INTO skills (portfolio_id, name, level, category, display_order)
       VALUES ($1, $2, $3, $4, $5)`,
      [portfolioId, name, level || null, category || null, i]
    );
  }

  // Services
  for (let i = 0; i < services.length; i++) {
    const { title, description, price_range } = services[i];
    await client.query(
      `INSERT INTO services (portfolio_id, title, description, price_range, display_order)
       VALUES ($1, $2, $3, $4, $5)`,
      [portfolioId, title, description || null, price_range || null, i]
    );
  }

  // Social links
  for (const { platform, url } of social_links) {
    await client.query(
      `INSERT INTO social_links (portfolio_id, platform, url) VALUES ($1, $2, $3)`,
      [portfolioId, platform, url]
    );
  }

  // Projects + their images
  for (let i = 0; i < projects.length; i++) {
    const { title, description, tech_stack = [], live_url, repo_url, images = [] } = projects[i];

    const { rows } = await client.query(
      `INSERT INTO projects (portfolio_id, title, description, tech_stack, live_url, repo_url, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [portfolioId, title, description || null, tech_stack, live_url || null, repo_url || null, i]
    );
    const projectId = rows[0].id;

    for (let j = 0; j < images.length; j++) {
      const { url, is_thumbnail = false } = images[j];
      await client.query(
        `INSERT INTO project_images (project_id, url, is_thumbnail, display_order)
         VALUES ($1, $2, $3, $4)`,
        [projectId, url, is_thumbnail, j]
      );
    }
  }
};

// ── DELETE child rows so we can re-insert on update ─────────────────────────
const deleteChildren = async (client, portfolioId) => {
  // projects deletion cascades to project_images automatically
  await Promise.all([
    client.query('DELETE FROM skills       WHERE portfolio_id = $1', [portfolioId]),
    client.query('DELETE FROM services     WHERE portfolio_id = $1', [portfolioId]),
    client.query('DELETE FROM social_links WHERE portfolio_id = $1', [portfolioId]),
    client.query('DELETE FROM projects     WHERE portfolio_id = $1', [portfolioId]),
  ]);
};

// ────────────────────────────────────────────────────────────────────────────
// POST /api/portfolio
// ────────────────────────────────────────────────────────────────────────────
const createPortfolio = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const {
      template_id,
      name, title, bio,
      email, phone, location,
      avatar_url, resume_url,
      skills      = [],
      services    = [],
      social_links = [],
      projects    = [],
    } = req.body;

    const code = await getUniqueCode(client);

    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO portfolios
         (code, template_id, name, title, bio, email, phone, location, avatar_url, resume_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id, code`,
      [code, Number(template_id), name.trim(), title || null, bio || null,
       email || null, phone || null, location || null, avatar_url || null, resume_url || null]
    );

    const { id: portfolioId } = rows[0];
    await insertChildren(client, portfolioId, { skills, services, social_links, projects });

    await client.query('COMMIT');

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.status(201).json({
      success: true,
      code,
      url: `${frontendUrl}/p/${code}`,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// ────────────────────────────────────────────────────────────────────────────
// GET /api/portfolio/:code
// ────────────────────────────────────────────────────────────────────────────
const getPortfolio = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { code } = req.params;

    // Increment views atomically and return portfolio in one query
    const { rows } = await client.query(
      `UPDATE portfolios
       SET views = views + 1
       WHERE code = $1 AND is_active = TRUE
       RETURNING *`,
      [code]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Portfolio not found' });
    }

    const portfolio = rows[0];

    // Fetch all child data in parallel — one round-trip per table
    const [projectsRes, skillsRes, servicesRes, socialRes] = await Promise.all([
      client.query(
        `SELECT
           p.*,
           COALESCE(
             json_agg(pi ORDER BY pi.display_order) FILTER (WHERE pi.id IS NOT NULL),
             '[]'
           ) AS images
         FROM projects p
         LEFT JOIN project_images pi ON pi.project_id = p.id
         WHERE p.portfolio_id = $1
         GROUP BY p.id
         ORDER BY p.display_order`,
        [portfolio.id]
      ),
      client.query(
        'SELECT * FROM skills       WHERE portfolio_id = $1 ORDER BY display_order',
        [portfolio.id]
      ),
      client.query(
        'SELECT * FROM services     WHERE portfolio_id = $1 ORDER BY display_order',
        [portfolio.id]
      ),
      client.query(
        'SELECT * FROM social_links WHERE portfolio_id = $1',
        [portfolio.id]
      ),
    ]);

    res.json({
      success: true,
      data: {
        ...portfolio,
        projects:     projectsRes.rows,
        skills:       skillsRes.rows,
        services:     servicesRes.rows,
        social_links: socialRes.rows,
      },
    });
  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
};

// ────────────────────────────────────────────────────────────────────────────
// PUT /api/portfolio/:code
// ────────────────────────────────────────────────────────────────────────────
const updatePortfolio = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { code } = req.params;

    const existing = await client.query(
      'SELECT id FROM portfolios WHERE code = $1 AND is_active = TRUE',
      [code]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Portfolio not found' });
    }
    const portfolioId = existing.rows[0].id;

    const {
      template_id,
      name, title, bio,
      email, phone, location,
      avatar_url, resume_url,
      skills      = [],
      services    = [],
      social_links = [],
      projects    = [],
    } = req.body;

    await client.query('BEGIN');

    // COALESCE keeps old value if new value is null/undefined
    await client.query(
      `UPDATE portfolios SET
         template_id = COALESCE($1, template_id),
         name        = COALESCE($2, name),
         title       = COALESCE($3, title),
         bio         = COALESCE($4, bio),
         email       = COALESCE($5, email),
         phone       = COALESCE($6, phone),
         location    = COALESCE($7, location),
         avatar_url  = COALESCE($8, avatar_url),
         resume_url  = COALESCE($9, resume_url)
       WHERE id = $10`,
      [template_id ? Number(template_id) : null,
       name?.trim() || null, title || null, bio || null,
       email || null, phone || null, location || null,
       avatar_url || null, resume_url || null,
       portfolioId]
    );

    // Simplest correct strategy for MVP: delete & re-insert child rows
    await deleteChildren(client, portfolioId);
    await insertChildren(client, portfolioId, { skills, services, social_links, projects });

    await client.query('COMMIT');

    res.json({ success: true, message: 'Portfolio updated' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// ────────────────────────────────────────────────────────────────────────────
// DELETE /api/portfolio/:code  (soft delete — keeps data, just hides it)
// ────────────────────────────────────────────────────────────────────────────
const deletePortfolio = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { rows } = await pool.query(
      'UPDATE portfolios SET is_active = FALSE WHERE code = $1 AND is_active = TRUE RETURNING id',
      [code]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Portfolio not found' });
    }

    res.json({ success: true, message: 'Portfolio deactivated' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPortfolio, getPortfolio, updatePortfolio, deletePortfolio };
