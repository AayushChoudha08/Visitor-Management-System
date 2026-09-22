const JsonRepository = require('../repositories/jsonRepository');
const { generateVisitorId } = require('../utils/idGenerator');
const auditService = require('./auditService');

class VisitorService {
  constructor() {
    this.repo = new JsonRepository('visitors.json');
  }

  async getAllVisitors(query = '') {
    const visitors = await this.repo.findAll();
    if (!query || !query.trim()) {
      return visitors;
    }
    const q = query.toLowerCase().trim();
    return visitors.filter(
      (vis) =>
        vis.name.toLowerCase().includes(q) ||
        (vis.email && vis.email.toLowerCase().includes(q)) ||
        (vis.phone && vis.phone.toLowerCase().includes(q)) ||
        (vis.company && vis.company.toLowerCase().includes(q)) ||
        (vis.idNumber && vis.idNumber.toLowerCase().includes(q))
    );
  }

  async getVisitorById(id) {
    return await this.repo.findById(id);
  }

  async createVisitor(payload, performedBy = 'Self Registration', role = 'Front Desk') {
    const all = await this.repo.findAll();
    const id = generateVisitorId(all.length);

    const newVisitor = {
      id,
      name: payload.name.trim(),
      email: payload.email ? payload.email.trim() : '',
      phone: payload.phone.trim(),
      company: payload.company ? payload.company.trim() : 'Independent / Individual',
      idType: payload.idType || 'Government ID',
      idNumber: payload.idNumber ? payload.idNumber.trim() : 'N/A',
      photo: payload.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    };

    const saved = await this.repo.create(newVisitor);

    await auditService.logActivity({
      action: 'VISITOR_REGISTERED',
      visitorId: id,
      performedBy,
      role,
      details: `Registered visitor ${saved.name} (${saved.company})`
    });

    return saved;
  }

  async updateVisitor(id, updates) {
    return await this.repo.update(id, updates);
  }
}

module.exports = new VisitorService();
