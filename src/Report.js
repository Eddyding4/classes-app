import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from './App';

function Report() {
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState('');
    const [tempParameter, setTempParameter] = useState('');
    const authContext = useContext(AuthContext);

    const fetchData = useCallback(async (url) => {
      setIsLoading(true);
      try {
          const response = await fetch(url, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${authContext.token}`, 
                  'Content-Type': 'application/json'
              },
          });

          if (!response.ok) {
              throw new Error(`Error: ${response.status}`);
          }
          const data = await response.json();
          setReportData(data);
      } catch (error) {
          setError(error.message);
      } finally {
          setIsLoading(false);
      }
  }, [authContext.token]);

      useEffect(() => {
        fetchData('http://localhost:5000/api/getReports');
    }, [fetchData]);

    const handleSubmit = (event) => {
        event.preventDefault();
        let url = 'http://localhost:5000/api/getReports';
        if (filterType) {
            url = `http://localhost:5000/api/filter?filter_type=${filterType}&parameter=${tempParameter}`;
        }
        fetchData(url);
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div>
            <h1>Class Report</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="filterType">Filter Type:</label>
                    <select id="filterType" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="">None</option>
                        <option value="department">Department</option>
                        <option value="level_desc">Level Descending</option>
                        <option value="students_desc">Students Descending</option>
                        <option value="gpa_desc">GPA Descending</option>
                        <option value="common_grade_level">Common Grade Level</option>
                    </select>
                </div>

                {filterType === 'department' || filterType === 'common_grade_level' ? (
                    <div>
                        <label htmlFor="parameter">Parameter:</label>
                        <input id="parameter" type="text" value={tempParameter} onChange={(e) => setTempParameter(e.target.value)} />
                    </div>
                ) : null}

                <button type="submit">Apply Filter</button>
            </form>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Level</th>
                        <th>Credits</th>
                        <th>Number of Students</th>
                        <th>Average GPA</th>
                        <th>Most Common Grade Level</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(reportData) && reportData.map((item, index) => (
                        <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.department}</td>
                            <td>{item.level}</td>
                            <td>{item.credits}</td>
                            <td>{item.number_of_students}</td>
                            <td>{item.average_gpa}</td>
                            <td>{item.most_common_grade}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Report;