const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { User, Activity, AcademicYear, SerialHistory } = require('../models');
const { Op } = require('sequelize');

// Test endpoint without authentication
router.get('/public-test', async (req, res) => {
  try {
    res.json({
      success: true,
      data: { message: 'Public test endpoint working' },
      message: 'Public test successful'
    });
  } catch (error) {
    console.error('Public test error:', error);
    res.status(500).json({
      success: false,
      message: 'Public test failed'
    });
  }
});

// Test API endpoints for new features
router.get('/academic-years', requireRole('ADMIN', 'STUDENT'), async (req, res) => {
  try {
    const academicYears = await AcademicYear.findAll({
      order: [['year', 'DESC']]
    });
    
    res.json({
      success: true,
      data: { academicYears },
      message: 'Academic years retrieved successfully'
    });
  } catch (error) {
    console.error('Test academic years error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch academic years'
    });
  }
});

// Test activities with academic year
router.get('/activities-with-year', requireRole('STUDENT', 'ADMIN'), async (req, res) => {
  try {
    const activities = await Activity.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'role']
        },
        {
          model: AcademicYear,
          as: 'academicYear',
          attributes: ['year', 'year_thai']
        }
      ],
      order: [['start_date', 'DESC']],
      limit: 10
    });
    
    res.json({
      success: true,
      data: { activities },
      message: 'Activities with academic year retrieved successfully'
    });
  } catch (error) {
    console.error('Test activities with year error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities with academic year'
    });
  }
});

// Test student progress by academic year
router.get('/student-progress-yearly', requireRole('STUDENT', 'ADMIN'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { academic_year } = req.query;
    
    if (!academic_year) {
      return res.status(400).json({
        success: false,
        message: 'Academic year is required'
      });
    }
    
    // Get total hours earned by student in specific academic year
    const totalHours = await SerialHistory.sum('hours_earned', {
      where: { user_id: userId },
      include: [{
        model: Activity,
        as: 'activity',
        where: { academic_year: academic_year },
        attributes: []
      }]
    }) || 0;
    
    // Get activity count in specific academic year
    const activityCount = await SerialHistory.count({
      where: { user_id: userId },
      include: [{
        model: Activity,
        as: 'activity',
        where: { academic_year: academic_year },
        attributes: []
      }]
    }) || 0;
    
    // Get detailed activities in this academic year
    const activities = await SerialHistory.findAll({
      where: { user_id: userId },
      include: [{
        model: Activity,
        as: 'activity',
        where: { academic_year: academic_year },
        attributes: ['title', 'start_date', 'hours_awarded', 'academic_year']
      }],
      order: [['redeemed_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: {
        academic_year,
        totalHours,
        activityCount,
        averageHours: activityCount > 0 ? Math.round((totalHours / activityCount) * 100) / 100 : 0,
        activities: activities.map(item => ({
          title: item.activity.title,
          start_date: item.activity.start_date,
          hours_awarded: item.activity.hours_awarded,
          academic_year: item.activity.academic_year,
          redeemed_at: item.redeemed_at
        }))
      },
      message: 'Student progress by academic year retrieved successfully'
    });
  } catch (error) {
    console.error('Test student progress yearly error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student progress by academic year'
    });
  }
});

// Test member reports with academic year
router.get('/member-reports-yearly', requireRole('ADMIN'), async (req, res) => {
  try {
    const { academic_year } = req.query;
    
    // Build where conditions
    const userWhere = { role: 'STUDENT' };
    const serialWhere = { is_reviewed: true };
    const activityWhere = {};
    
    if (academic_year) {
      activityWhere.academic_year = academic_year;
    }
    
    // Get summary data
    const totalMembers = await User.count({ where: userWhere });
    
    const totalHoursResult = await SerialHistory.findOne({
      where: serialWhere,
      attributes: [
        [require('sequelize').fn('SUM', require('sequelize').col('hours_earned')), 'total']
      ],
      include: [{
        model: User,
        as: 'user',
        where: userWhere,
        attributes: []
      }, {
        model: Activity,
        as: 'activity',
        where: Object.keys(activityWhere).length > 0 ? activityWhere : undefined,
        attributes: []
      }]
    });
    
    const totalHours = totalHoursResult?.dataValues?.total || 0;
    const averageHours = totalMembers > 0 ? (totalHours / totalMembers).toFixed(1) : 0;
    
    // Get academic year progress data
    const academicYearProgress = await SerialHistory.findAll({
      attributes: [
        [require('sequelize').col('activity.academic_year'), 'academic_year'],
        [require('sequelize').fn('SUM', require('sequelize').col('hours_earned')), 'totalHours']
      ],
      include: [{
        model: User,
        as: 'user',
        where: userWhere,
        attributes: []
      }, {
        model: Activity,
        as: 'activity',
        where: { academic_year: { [Op.ne]: null } },
        attributes: []
      }],
      where: serialWhere,
      group: ['activity.academic_year'],
      order: [[require('sequelize').col('activity.academic_year'), 'DESC']]
    });
    
    res.json({
      success: true,
      data: {
        summary: {
          totalMembers,
          totalHours,
          averageHours
        },
        academicYearProgress: academicYearProgress.map(item => ({
          academic_year: item.dataValues.academic_year,
          totalHours: item.dataValues.totalHours
        }))
      },
      message: 'Member reports with academic year retrieved successfully'
    });
  } catch (error) {
    console.error('Test member reports yearly error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch member reports with academic year'
    });
  }
});

// Test activity CRUD operations
router.get('/activity-crud-test', requireRole('ADMIN'), async (req, res) => {
  try {
    // Test getting activities with all new fields
    const activities = await Activity.findAll({
      attributes: [
        'id', 'title', 'description', 'start_date', 'end_date', 
        'hours_awarded', 'location', 'max_participants', 
        'academic_year', 'academic_year_id', 'rescheduled_date', 'status'
      ],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'role']
        },
        {
          model: AcademicYear,
          as: 'academicYear',
          attributes: ['year', 'year_thai']
        }
      ],
      order: [['id', 'DESC']],
      limit: 5
    });
    
    res.json({
      success: true,
      data: { activities },
      message: 'Activity CRUD test data retrieved successfully'
    });
  } catch (error) {
    console.error('Test activity CRUD error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity CRUD test data'
    });
  }
});

// Test system status
router.get('/system-status', requireAuth, async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.count(),
      totalActivities: await Activity.count(),
      totalAcademicYears: await AcademicYear.count(),
      totalSerialHistory: await SerialHistory.count(),
      user: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role
      }
    };
    
    res.json({
      success: true,
      data: { stats },
      message: 'System status retrieved successfully'
    });
  } catch (error) {
    console.error('Test system status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system status'
    });
  }
});

module.exports = router;
