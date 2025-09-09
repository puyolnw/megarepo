import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const StudentProgress = () => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [yearlyProgress, setYearlyProgress] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [selectedAcademicYear]);

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchYearlyProgress(selectedAcademicYear);
    }
  }, [selectedAcademicYear]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedAcademicYear) {
        params.append('academic_year', selectedAcademicYear);
      }
      
      const response = await api.get(`/student/progress?${params}`);
      if (response.data.success) {
        setProgress(response.data.data);
      } else {
        setError('ไม่สามารถโหลดข้อมูลความก้าวหน้าได้');
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      setError('ไม่สามารถโหลดข้อมูลความก้าวหน้าได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await api.get('/student/academic-years');
      if (response.data.success) {
        const years = response.data.data.academicYears || [];
        setAcademicYears(years);
        // Set default to current active year
        const currentYear = years.find(year => year.is_active);
        if (currentYear) {
          setSelectedAcademicYear(currentYear.year);
        }
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const fetchYearlyProgress = async (academicYear) => {
    try {
      const response = await api.get(`/student/progress/yearly?academic_year=${academicYear}`);
      if (response.data.success) {
        setYearlyProgress(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching yearly progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3">กำลังโหลดข้อมูลความก้าวหน้า...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <div className="alert alert-danger" style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>เกิดข้อผิดพลาด:</strong> {error}
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <div className="alert alert-warning" style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #ffeaa7'
        }}>
          <strong>ไม่พบข้อมูล:</strong> ไม่มีข้อมูลความก้าวหน้า
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(40,167,69,0.3)'
      }}>
        <div className="row align-items-center">
          <div className="col-md-8">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: 'bold' }}>
              ⏰ ชั่วโมงกิจกรรม
            </h1>
            <p style={{ fontSize: '1.2rem', margin: 0, opacity: 0.9 }}>
              สวัสดี {user?.name}! นี่คือความก้าวหน้าในการสะสมชั่วโมงกิจกรรมของคุณ
            </p>
          </div>
          <div className="col-md-4 text-end">
            <div style={{ fontSize: '4rem', opacity: 0.8 }}>📈</div>
          </div>
        </div>
      </div>
      
      
      {/* Progress Bar */}
      <div className="card mb-4" style={{ border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
        <div className="card-header" style={{ backgroundColor: '#f8f9fa', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, color: '#333' }}>📊 สรุปความก้าวหน้า</h4>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: progress.isCompleted ? '#28a745' : '#007bff' }}>
              {progress.progressPercentage}%
            </span>
          </div>
        </div>
        <div className="card-body">
          <div style={{ 
            width: '100%', 
            backgroundColor: '#e9ecef', 
            borderRadius: '25px', 
            height: '20px', 
            marginBottom: '20px',
            overflow: 'hidden'
          }}>
            <div 
              style={{ 
                height: '100%', 
                borderRadius: '25px', 
                transition: 'all 0.8s ease',
                background: progress.isCompleted 
                  ? 'linear-gradient(90deg, #28a745 0%, #20c997 100%)' 
                  : 'linear-gradient(90deg, #007bff 0%, #0056b3 100%)',
                width: `${Math.min(progress.progressPercentage, 100)}%`
              }}
            ></div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div style={{ flex: 1, padding: '10px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>
                {progress.totalHours}
              </span>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>ชั่วโมงที่สะสมได้</p>
            </div>
            <div style={{ flex: 1, padding: '10px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffc107' }}>
                {progress.remainingHours}
              </span>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>ชั่วโมงที่เหลือ</p>
            </div>
            <div style={{ flex: 1, padding: '10px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#6f42c1' }}>
                {progress.requiredHours}
              </span>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>ชั่วโมงที่ต้องการ</p>
            </div>
          </div>
          
          {progress.isCompleted && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '10px',
              color: '#155724'
            }}>
              <div className="d-flex align-items-center">
                <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>🎉</span>
                <div>
                  <strong>ยินดีด้วย!</strong> คุณได้สะสมชั่วโมงครบตามที่กำหนดแล้ว
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Academic Year Progress */}
      {academicYears.length > 0 && (
        <div className="card mb-4" style={{ border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
          <div className="card-header" style={{ backgroundColor: '#f8f9fa', border: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, color: '#333' }}>📅 ชั่วโมงตามปีการศึกษา</h4>
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
              >
                {academicYears.map(year => (
                  <option key={year.id} value={year.year}>{year.year_thai}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="card-body">
            {yearlyProgress.totalHours !== undefined ? (
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div style={{ flex: 1, padding: '15px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px', color: '#28a745' }}>⏰</div>
                  <h4 style={{ marginBottom: '5px', color: '#333', fontWeight: 'bold' }}>
                    {yearlyProgress.totalHours || 0}
                  </h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>ชั่วโมงสะสมในปี {selectedAcademicYear}</p>
                </div>
                <div style={{ flex: 1, padding: '15px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px', color: '#007bff' }}>📊</div>
                  <h4 style={{ marginBottom: '5px', color: '#333', fontWeight: 'bold' }}>
                    {yearlyProgress.activityCount || 0}
                  </h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>จำนวนกิจกรรมที่เข้าร่วม</p>
                </div>
                <div style={{ flex: 1, padding: '15px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px', color: '#ffc107' }}>📈</div>
                  <h4 style={{ marginBottom: '5px', color: '#333', fontWeight: 'bold' }}>
                    {yearlyProgress.averageHours ? yearlyProgress.averageHours.toFixed(1) : '0.0'}
                  </h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>ชั่วโมงเฉลี่ยต่อกิจกรรม</p>
                </div>
                <div style={{ flex: 1, padding: '15px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px', color: '#6f42c1' }}>🎯</div>
                  <h4 style={{ marginBottom: '5px', color: '#333', fontWeight: 'bold' }}>
                    {progress.requiredHours}
                  </h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>เป้าหมายชั่วโมง</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.5 }}>📊</div>
                <p style={{ color: '#666', margin: 0 }}>กำลังโหลดข้อมูลปีการศึกษา...</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Recent Activity */}
      <div className="card" style={{ border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
        <div className="card-header" style={{ backgroundColor: '#f8f9fa', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, color: '#333' }}>📋 กิจกรรมล่าสุด</h4>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              {academicYears.map(year => (
                <option key={year.id} value={year.year}>{year.year_thai}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="card-body">
          {progress.recentHistory && progress.recentHistory.length > 0 ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {progress.recentHistory.map((item, index) => (
                <div key={index} style={{
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '10px',
                  border: '1px solid #e9ecef',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9ecef'
                  e.currentTarget.style.transform = 'translateX(5px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: '#007bff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.2rem',
                      flexShrink: 0
                    }}>
                      ⏱️
                    </div>
                    <div style={{ flex: 1 }}>
                      <h6 style={{ marginBottom: '5px', color: '#333', fontWeight: 'bold' }}>
                        {item.activity.title}
                      </h6>
                      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                        Serial: <strong>{item.serial.code}</strong> • 
                        วันที่: {new Date(item.redeemed_at).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        display: 'inline-block'
                      }}>
                        +{item.hours_earned} ชั่วโมง
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center" style={{ padding: '40px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.5 }}>📋</div>
              <h5 style={{ color: '#666', marginBottom: '10px' }}>ยังไม่มีกิจกรรมล่าสุด</h5>
              <p style={{ color: '#999', fontSize: '14px' }}>
                เริ่มเข้าร่วมกิจกรรมเพื่อดูประวัติการสะสมชั่วโมงของคุณ
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;
