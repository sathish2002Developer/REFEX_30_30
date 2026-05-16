const { InvestorFile } = require("../models");
const status = require("../helpers/response");
const path = require("path");
const fs = require("fs");

// Get all investor files
exports.getAllInvestorFiles = async (req, res) => {
  try {
    const files = await InvestorFile.findAll({
      where: { is_active: true },
      order: [['year', 'DESC'], ['date', 'DESC']],
    });

    // Group files by section and year
    const filesBySection = {};
    files.forEach((file) => {
      const section = file.section || 'annual-return';
      if (!filesBySection[section]) {
        filesBySection[section] = {};
      }
      const year = file.year || 'general';
      if (!filesBySection[section][year]) {
        filesBySection[section][year] = [];
      }
      filesBySection[section][year].push({
        id: file.id,
        section: file.section,
        year: file.year,
        name: file.name,
        url: file.url,
        type: file.type,
        size: file.size,
        date: file.date,
        createdAt: file.created_at,
      });
    });

    // For backward compatibility, also provide filesByYear for annual-return section
    const annualReturnFiles = filesBySection['annual-return'] || {};
    const filesByYear = {};
    Object.keys(annualReturnFiles).forEach(year => {
      filesByYear[year] = annualReturnFiles[year];
    });
    const years = Object.keys(filesByYear).sort().reverse();

    return status.responseStatus(res, 200, "Investor files retrieved successfully", {
      filesBySection,
      filesByYear, // Backward compatibility
      years, // Backward compatibility
    });
  } catch (error) {
    console.error("Error fetching investor files:", error);
    return status.responseStatus(res, 500, "Error fetching investor files", null, error.message);
  }
};

// Get investor files by year
exports.getInvestorFilesByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const files = await InvestorFile.findAll({
      where: { year, is_active: true },
      order: [['date', 'DESC']],
    });

    return status.responseStatus(res, 200, "Investor files retrieved successfully", files);
  } catch (error) {
    console.error("Error fetching investor files:", error);
    return status.responseStatus(res, 500, "Error fetching investor files", null, error.message);
  }
};

// Upload and create investor file
exports.createInvestorFile = async (req, res) => {
  try {
    if (!req.file) {
      return status.responseStatus(res, 400, "No file uploaded");
    }

    const { section, year, name, date, type } = req.body;

    if (!name) {
      // Delete uploaded file if validation fails
      const filePath = path.join(__dirname, "../uploads/investor", req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return status.responseStatus(res, 400, "File name is required");
    }

    // Year is required for annual-return section, optional for notice
    if (section === 'annual-return' && !year) {
      const filePath = path.join(__dirname, "../uploads/investor", req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return status.responseStatus(res, 400, "Year is required for Annual Return section");
    }

    const sectionType = section || 'annual-return';
    const fileYear = year || (sectionType === 'notice' ? date || new Date().toISOString().split('T')[0] : null);

    // Get file size in MB
    const fileSizeMB = (req.file.size / (1024 * 1024)).toFixed(2);

    // Determine file type from extension
    const ext = path.extname(req.file.originalname).toLowerCase();
    let fileType = type || 'pdf';
    if (ext === '.pdf') fileType = 'pdf';
    else if (ext === '.doc' || ext === '.docx') fileType = 'doc';
    else if (ext === '.xls' || ext === '.xlsx') fileType = 'xls';

    // Create file URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/investor/${req.file.filename}`;

    // Create database record
    const investorFile = await InvestorFile.create({
      section: sectionType,
      year: fileYear,
      name,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      type: fileType,
      size: `${fileSizeMB} MB`,
      date: date || new Date().toISOString().split('T')[0],
    });

    return status.responseStatus(res, 201, "Investor file uploaded successfully", {
      id: investorFile.id,
      section: investorFile.section,
      year: investorFile.year,
      name: investorFile.name,
      url: investorFile.url,
      type: investorFile.type,
      size: investorFile.size,
      date: investorFile.date,
      createdAt: investorFile.created_at,
    });
  } catch (error) {
    console.error("Error creating investor file:", error);
    
    // Delete uploaded file if database creation fails
    if (req.file) {
      const filePath = path.join(__dirname, "../uploads/investor", req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return status.responseStatus(res, 500, "Error creating investor file", null, error.message);
  }
};

// Update investor file
exports.updateInvestorFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { year, name, date, type, size } = req.body;

    const investorFile = await InvestorFile.findByPk(id);
    if (!investorFile) {
      return status.responseStatus(res, 404, "Investor file not found");
    }

    // Update fields
    if (year) investorFile.year = year;
    if (name) investorFile.name = name;
    if (date) investorFile.date = date;
    if (type) investorFile.type = type;
    if (size) investorFile.size = size;

    await investorFile.save();

    return status.responseStatus(res, 200, "Investor file updated successfully", investorFile);
  } catch (error) {
    console.error("Error updating investor file:", error);
    return status.responseStatus(res, 500, "Error updating investor file", null, error.message);
  }
};

// Delete investor file
exports.deleteInvestorFile = async (req, res) => {
  try {
    const { id } = req.params;

    const investorFile = await InvestorFile.findByPk(id);
    if (!investorFile) {
      return status.responseStatus(res, 404, "Investor file not found");
    }

    // Delete physical file
    const filePath = path.join(__dirname, "../uploads/investor", investorFile.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete database record
    await investorFile.destroy();

    return status.responseStatus(res, 200, "Investor file deleted successfully");
  } catch (error) {
    console.error("Error deleting investor file:", error);
    return status.responseStatus(res, 500, "Error deleting investor file", null, error.message);
  }
};

// Get all years
exports.getYears = async (req, res) => {
  try {
    const files = await InvestorFile.findAll({
      where: { is_active: true },
      attributes: ['year'],
      group: ['year'],
      order: [['year', 'DESC']],
    });

    const years = files.map(f => f.year);
    return status.responseStatus(res, 200, "Years retrieved successfully", years);
  } catch (error) {
    console.error("Error fetching years:", error);
    return status.responseStatus(res, 500, "Error fetching years", null, error.message);
  }
};

