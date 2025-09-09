const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  hours_awarded: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  public_slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'OPEN', 'CLOSED', 'CANCELLED'),
    defaultValue: 'DRAFT'
  },
  academic_year: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'ปีการศึกษา (เช่น 2568)'
  },
  academic_year_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'academic_years',
      key: 'id'
    },
    comment: 'ID ของปีการศึกษา'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'สถานที่จัดกิจกรรม'
  },
  max_participants: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'จำนวนผู้เข้าร่วมสูงสุด'
  },
  rescheduled_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'วันที่เลื่อนกิจกรรม (สำหรับเลื่อนวัน)'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'activities',
  timestamps: false,
  indexes: [
    {
      fields: ['academic_year']
    },
    {
      fields: ['academic_year_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_by']
    }
  ],
  validate: {
    endDateAfterStartDate() {
      if (this.end_date <= this.start_date) {
        throw new Error('End date must be after start date');
      }
    }
  }
});

Activity.associate = (models) => {
  Activity.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator'
  });
  
  Activity.belongsTo(models.AcademicYear, {
    foreignKey: 'academic_year_id',
    as: 'academicYear'
  });
  
  Activity.hasMany(models.SerialHistory, {
    foreignKey: 'activity_id',
    as: 'serialHistories'
  });
  
  Activity.hasMany(models.ActivityReview, {
    foreignKey: 'activity_id',
    as: 'reviews'
  });
};

module.exports = Activity;