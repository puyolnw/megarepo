import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const TestPage = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAcademicYears();
      runAllTests();
    }
  }, [user]);

  const fetchAcademicYears = async () => {
    try {
      const response = await api.get('/test/academic-years');
      if (response.data.success) {
        setAcademicYears(response.data.data.academicYears || []);
        if (response.data.data.academicYears.length > 0) {
          setSelectedAcademicYear(response.data.data.academicYears[0].year);
        }
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const runTest = async (testName, testFunction) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    setError(prev => ({ ...prev, [testName]: '' }));
    
    try {
      const result = await testFunction();
      setTestResults(prev => ({ ...prev, [testName]: result }));
    } catch (error) {
      console.error(`Test ${testName} error:`, error);
      setError(prev => ({ ...prev, [testName]: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const runAllTests = () => {
    runTest('publicTest', () => api.get('/test/public-test'));
    runTest('systemStatus', () => api.get('/test/system-status'));
    runTest('academicYears', () => api.get('/test/academic-years'));
    runTest('activitiesWithYear', () => api.get('/test/activities-with-year'));
    runTest('activityCrudTest', () => api.get('/test/activity-crud-test'));
  };

  const runStudentProgressTest = () => {
    if (!selectedAcademicYear) {
      setError(prev => ({ ...prev, studentProgressYearly: 'กรุณาเลือกปีการศึกษา' }));
      return;
    }
    runTest('studentProgressYearly', () => 
      api.get(`/test/student-progress-yearly?academic_year=${selectedAcademicYear}`)
    );
  };

  const runMemberReportsTest = () => {
    if (!selectedAcademicYear) {
      setError(prev => ({ ...prev, memberReportsYearly: 'กรุณาเลือกปีการศึกษา' }));
      return;
    }
    runTest('memberReportsYearly', () => 
      api.get(`/test/member-reports-yearly?academic_year=${selectedAcademicYear}`)
    );
  };

  const formatTestResult = (result) => {
    if (!result) return 'No data';
    return JSON.stringify(result, null, 2);
  };

  const TestCard = ({ title, testName, onRunTest, children }) => (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">{title}</h6>
        <button
          className="btn btn-sm btn-primary"
          onClick={onRunTest}
          disabled={loading[testName]}
        >
          {loading[testName] ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Testing...
            </>
          ) : (
            <>
              <i className="fas fa-play me-2"></i>
              Run Test
            </>
          )}
        </button>
      </div>
      <div className="card-body">
        {error[testName] && (
          <div className="alert alert-danger">
            <strong>Error:</strong> {error[testName]}
          </div>
        )}
        {testResults[testName] && (
          <div>
            <h6>Test Result:</h6>
            <pre className="bg-light p-3 rounded" style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
              {formatTestResult(testResults[testName].data)}
            </pre>
          </div>
        )}
        {children}
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">กรุณาเข้าสู่ระบบเพื่อทดสอบฟีเจอร์</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1 text-primary">
                <i className="fas fa-flask me-2"></i>
                หน้าเทส API และ Frontend
              </h2>
              <p className="text-muted mb-0">ทดสอบฟีเจอร์ใหม่ที่เพิ่มเข้ามาในระบบ</p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-success"
                onClick={runAllTests}
                disabled={Object.values(loading).some(l => l)}
              >
                <i className="fas fa-play me-2"></i>
                รันเทสทั้งหมด
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="alert alert-info">
            <strong>ผู้ใช้ปัจจุบัน:</strong> {user.name} ({user.role})
          </div>
        </div>
      </div>

      {/* Academic Year Selector */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">เลือกปีการศึกษาสำหรับทดสอบ</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <select
                    className="form-select"
                    value={selectedAcademicYear}
                    onChange={(e) => setSelectedAcademicYear(e.target.value)}
                  >
                    <option value="">เลือกปีการศึกษา</option>
                    {academicYears.map(year => (
                      <option key={year.id} value={year.year}>{year.year_thai}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <p className="text-muted mb-0">
                    เลือกปีการศึกษาเพื่อทดสอบฟีเจอร์ที่เกี่ยวข้องกับปีการศึกษา
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Cards */}
      <div className="row">
        <div className="col-lg-6">
          <TestCard
            title="0. ทดสอบ Public API (Public Test)"
            testName="publicTest"
            onRunTest={() => runTest('publicTest', () => api.get('/test/public-test'))}
          >
            <p className="text-muted">ทดสอบ API endpoint ที่ไม่ต้องการ authentication</p>
          </TestCard>

          <TestCard
            title="1. ระบบสถานะ (System Status)"
            testName="systemStatus"
            onRunTest={() => runTest('systemStatus', () => api.get('/test/system-status'))}
          >
            <p className="text-muted">ทดสอบการเชื่อมต่อและข้อมูลพื้นฐานของระบบ</p>
          </TestCard>

          <TestCard
            title="2. ข้อมูลปีการศึกษา (Academic Years)"
            testName="academicYears"
            onRunTest={() => runTest('academicYears', () => api.get('/test/academic-years'))}
          >
            <p className="text-muted">ทดสอบการดึงข้อมูลปีการศึกษาทั้งหมด</p>
          </TestCard>

          <TestCard
            title="3. กิจกรรมพร้อมปีการศึกษา (Activities with Academic Year)"
            testName="activitiesWithYear"
            onRunTest={() => runTest('activitiesWithYear', () => api.get('/test/activities-with-year'))}
          >
            <p className="text-muted">ทดสอบการดึงข้อมูลกิจกรรมพร้อมข้อมูลปีการศึกษา</p>
          </TestCard>

          <TestCard
            title="4. ทดสอบ CRUD กิจกรรม (Activity CRUD Test)"
            testName="activityCrudTest"
            onRunTest={() => runTest('activityCrudTest', () => api.get('/test/activity-crud-test'))}
          >
            <p className="text-muted">ทดสอบการดึงข้อมูลกิจกรรมพร้อมฟิลด์ใหม่ทั้งหมด</p>
          </TestCard>
        </div>

        <div className="col-lg-6">
          <TestCard
            title="5. ความก้าวหน้านักศึกษาตามปีการศึกษา (Student Progress by Year)"
            testName="studentProgressYearly"
            onRunTest={runStudentProgressTest}
          >
            <p className="text-muted">ทดสอบการดึงข้อมูลความก้าวหน้านักศึกษาตามปีการศึกษา</p>
            <small className="text-muted">* ต้องเลือกปีการศึกษาก่อน</small>
          </TestCard>

          <TestCard
            title="6. รายงานสมาชิกตามปีการศึกษา (Member Reports by Year)"
            testName="memberReportsYearly"
            onRunTest={runMemberReportsTest}
          >
            <p className="text-muted">ทดสอบการดึงข้อมูลรายงานสมาชิกตามปีการศึกษา</p>
            <small className="text-muted">* ต้องเลือกปีการศึกษาก่อน</small>
          </TestCard>
        </div>
      </div>

      {/* Test Summary */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">สรุปผลการทดสอบ</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <div className="text-center">
                    <div className="h4 text-primary">
                      {Object.keys(testResults).length}
                    </div>
                    <small className="text-muted">เทสที่ผ่าน</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <div className="h4 text-danger">
                      {Object.keys(error).filter(key => error[key]).length}
                    </div>
                    <small className="text-muted">เทสที่ล้มเหลว</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <div className="h4 text-warning">
                      {Object.keys(loading).filter(key => loading[key]).length}
                    </div>
                    <small className="text-muted">กำลังทดสอบ</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <div className="h4 text-info">
                      {academicYears.length}
                    </div>
                    <small className="text-muted">ปีการศึกษา</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Status */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">สถานะฟีเจอร์ใหม่</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      เปลี่ยนชื่อแดชบอร์ดผู้ดูแลระบบ
                      <span className="badge bg-success">เสร็จสิ้น</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      เพิ่มปีการศึกษาในระบบสร้างกิจกรรม
                      <span className="badge bg-success">เสร็จสิ้น</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      เปลี่ยนรายงานสมาชิกเป็นรายงานนักศึกษา
                      <span className="badge bg-success">เสร็จสิ้น</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      เพิ่มฟีเจอร์แก้ไข ลบ ยกเลิก และเลื่อนวันกิจกรรม
                      <span className="badge bg-success">เสร็จสิ้น</span>
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      เปลี่ยนชั่วโมงที่เสร็จสิ้นเป็นชั่วโมงที่สะสมได้
                      <span className="badge bg-success">เสร็จสิ้น</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      เปลี่ยนความก้าวหน้าของฉันเป็นชั่วโมงกิจกรรม
                      <span className="badge bg-success">เสร็จสิ้น</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      เพิ่มระบบจัดการปีการศึกษาในระบบ
                      <span className="badge bg-success">เสร็จสิ้น</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      สร้างหน้าเทส API และ Frontend
                      <span className="badge bg-success">เสร็จสิ้น</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
