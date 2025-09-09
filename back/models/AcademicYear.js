const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AcademicYear = sequelize.define('AcademicYear', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  year: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    comment: 'ปีการศึกษา (เช่น 2568)'
  },
  year_thai: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'ปีการศึกษา (ภาษาไทย)'
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'วันที่เริ่มต้นปีการศึกษา'
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'วันที่สิ้นสุดปีการศึกษา'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'สถานะใช้งาน (1=ใช้งาน, 0=ไม่ใช้งาน)'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ผู้สร้าง'
  }
}, {
  tableName: 'academic_years',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['year']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['start_date']
    },
    {
      fields: ['end_date']
    }
  ]
});

module.exports = AcademicYear;
