const JsonRepository = require('../repositories/jsonRepository');

class EmployeeService {
  constructor() {
    this.repo = new JsonRepository('employees.json');
  }

  async getAllEmployees(query = '') {
    const employees = await this.repo.findAll();
    if (!query || !query.trim()) {
      return employees;
    }
    const q = query.toLowerCase().trim();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.phone.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.office.toLowerCase().includes(q)
    );
  }

  async getEmployeeById(id) {
    return await this.repo.findById(id);
  }
}

module.exports = new EmployeeService();
