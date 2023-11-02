import React, { useState, useContext } from 'react';
import { AuthContext } from './App';
import './ClassesPage.css';

function ClassesPage() {
  const [showModal, setShowModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [editingClassIndex, setEditingClassIndex] = useState(null);
  const { handleLogout } = useContext(AuthContext);

  const openModal = (index) => {
    setEditingClassIndex(index);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClassIndex(null);
  };

  const addClass = (newClass) => {
    fetch('http://localhost:5000/api/addClass', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newClass),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
        console.log("Received data:", data)
        if (editingClassIndex !== null) {
        const updatedClasses = [...classes];
        updatedClasses[editingClassIndex] = newClass;
        setClasses(updatedClasses);
        } else {
        setClasses([...classes, newClass]);
        }
        closeModal();
    } else {
        console.error('Failed to add class:', data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  const deleteClass = (index) => {
    const updatedClasses = classes.filter((_, i) => i !== index);
    setClasses(updatedClasses);
  };

  return (
    <div className="classes-page">
      <div className="class-container">
        <h1 className="class-title">Class List</h1>
        <div className="class-items-container">
          {classes.map((cls, index) => (
            <div key={index} className="class-item">
              <div className="edit-delete-buttons">
                <button onClick={() => openModal(index)} className="edit-button">Edit</button>
                <button onClick={() => deleteClass(index)} className="delete-button">Delete</button>
              </div>
              <p><strong>Class Name:</strong> {cls.name}</p>
              <p><strong>Department:</strong> {cls.department}</p>
              <p><strong>Level:</strong> {cls.level}</p>
              <p><strong>Credits:</strong> {cls.credits}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="toolbar-container">
        <div className="instructions-container">
            <h2>Instructions</h2>
            <p>-To utilize this tool, you can press the "Add" button to open a form.</p>
            <p>-Fill in the form with the details of your class to add the class in.</p>
            <p>-The class should appear in the class list. Add up to 9 classes.</p>
            <p>-You can also "Edit" or "Delete" using the buttons on the classes.</p>
            <p>-When finished adding classes press "Submit" to get the reports.</p>
            <p>-You can logout by pressing the "Logout" and return to login.</p>
        </div>
        <button className="action-button add-button" onClick={() => openModal(null)}>Add</button>
        <button className="action-button">Submit</button>
        <button className="action-button logout-button" onClick={handleLogout}>Logout</button>
        
      </div>
      {showModal && 
        <ClassFormModal 
          onClose={closeModal} 
          onSubmit={addClass} 
          initialClass={classes[editingClassIndex]} 
        />}
    </div>
  );
}

function ClassFormModal({ onClose, onSubmit, initialClass }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const newClass = {
      name: e.target.name.value,
      department: e.target.department.value,
      level: e.target.level.value,
      credits: e.target.credits.value,
    };
    onSubmit(newClass);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>{initialClass ? "Edit Class" : "Add Class"}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Name (i.e. Relational Databases):
            <input type="text" name="name" required defaultValue={initialClass?.name} />
          </label>
          <label>
            Department (i.e. Computer Science):
            <input type="text" name="department" required defaultValue={initialClass?.department} />
          </label>
          <label>
            Level (i.e. 348):
            <input type="number" name="level" required defaultValue={initialClass?.level} />
          </label>
          <label>
            Credits:
            <input type="number" name="credits" required defaultValue={initialClass?.credits} />
          </label>
          <button type="submit">{initialClass ? "Save" : "Submit"}</button>
        </form>
      </div>
    </div>
  );
}

export default ClassesPage;