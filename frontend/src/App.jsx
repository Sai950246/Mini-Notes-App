import { useEffect, useState, useCallback } from "react";
import { API } from "./api";
import "./App.css";

function App() {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Notes
  const fetchNotes = useCallback(async (searchTerm = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/notes?search=${searchTerm}`);
      setNotes(res.data);
    } catch (err) {
      setError("Failed to fetch notes. Please check if the server is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchNotes(search);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, fetchNotes]);

  // Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        await API.put(`/notes/${editingId}`, form);
        setEditingId(null);
      } else {
        await API.post("/notes", form);
      }
      setForm({ title: "", description: "" });
      fetchNotes(search);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Edit
  const handleEdit = (note) => {
    setForm({ title: note.title, description: note.description });
    setEditingId(note._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ title: "", description: "" });
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    
    setLoading(true);
    try {
      await API.delete(`/notes/${id}`);
      fetchNotes(search);
    } catch (err) {
      setError("Failed to delete the note.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <div className="header">
        <h1>Mini Notes App</h1>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Search */}
      <div className="search-container">
        <input
          id="search"
          name="search"
          className="search-input"
          placeholder="Search notes by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Form */}
      <div className="form-container">
        <h3>{editingId ? "Edit Note" : "Create a New Note"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              id="title"
              name="title"
              className="form-input"
              placeholder="Note Title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              placeholder="Write your note description here..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary">
              {editingId ? "Update Note" : "Add Note"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Notes List */}
      <div className="notes-grid">
        {notes.length === 0 && !loading && (
          <div className="empty-state">
            <p>{search ? "No notes found matching your search." : "No notes yet. Start by creating one above!"}</p>
          </div>
        )}
        {notes.map((note) => (
          <div key={note._id} className="note-card">
            <h3 className="note-title">{note.title}</h3>
            <p className="note-description">{note.description}</p>
            <div className="note-footer">
              <span>{new Date(note.createdAt).toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
              <div className="note-actions">
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleEdit(note)}>Edit</button>
                <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleDelete(note._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
