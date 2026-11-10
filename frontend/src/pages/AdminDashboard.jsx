
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotes: 0,
  });
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("overview");
  // USER MANAGEMENT STATES
const [users, setUsers] = useState([]);
const [usersLoading, setUsersLoading] = useState(false);
const [usersError, setUsersError] = useState("");
const [userSearch, setUserSearch] = useState("");

  // All Notes states
  const [allNotes, setAllNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [notesSearch, setNotesSearch] = useState("");
  

  useEffect(() => {
    const loadAdminDashboard = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const userResponse = await API.get("/auth/me");
        const currentUser = userResponse.data.user || userResponse.data;

        if (currentUser.role !== "admin") {
          navigate("/user-dashboard");
          return;
        }

        setUser(currentUser);

        const statsResponse = await API.get("/admin/stats");

        setStats(statsResponse.data.stats);
        setRecentNotes(statsResponse.data.recentNotes || []);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/");
          return;
        }

        if (err.response?.status === 403) {
          navigate("/user-dashboard");
          return;
        }

        setError(
          err.response?.data?.message ||
          "Unable to load admin dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAdminDashboard();
  }, [navigate]);

  // Load all users' notes for admin
  useEffect(() => {
    if (activePage !== "notes") return;

    const loadAllNotes = async () => {
      try {
        setNotesLoading(true);
        setNotesError("");

        const response = await API.get("/notes", {
          params: {
            page: 1,
            limit: 100,
            search: notesSearch
          }
        });

        setAllNotes(response.data.data || []);
      } catch (err) {
        setNotesError(
          err.response?.data?.message || "Unable to load notes."
        );
      } finally {
        setNotesLoading(false);
      }
    };

    loadAllNotes();
  }, [activePage, notesSearch]);

  // FETCH USERS FOR USER MANAGEMENT
useEffect(() => {
  if (activePage !== "users") return;

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError("");

      const response = await API.get("/admin/users", {
        params: {
          search: userSearch
        }
      });

      setUsers(response.data.users || []);

    } catch (error) {
      console.error("Fetch Users Error:", error);

      setUsersError(
        error.response?.data?.message ||
        "Unable to fetch users."
      );
    } finally {
      setUsersLoading(false);
    }
  };

  fetchUsers();
}, [activePage, userSearch]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setNotesSearch(searchTerm.trim());
  };

  const handleDeleteNote = async (noteId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) return;

    try {
      await API.delete(`/notes/${noteId}`);

      setAllNotes((previousNotes) =>
        previousNotes.filter((note) => note._id !== noteId)
      );

      setStats((previousStats) => ({
        ...previousStats,
        totalNotes: Math.max(0, previousStats.totalNotes - 1)
      }));

      setRecentNotes((previousNotes) =>
        previousNotes.filter((note) => note._id !== noteId)
      );
    } catch (err) {
      setNotesError(
        err.response?.data?.message || "Unable to delete note."
      );
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading Admin Dashboard...</div>;
  }

  if (!user) return null;

  return (
    <div className="admin-layout">

      <aside className="admin-sidebar">
        <div className="admin-logo">
          Notes Manager
        </div>

        <nav className="admin-navigation">
          <button
            className={activePage === "overview" ? "active" : ""}
            onClick={() => setActivePage("overview")}
          >
            Dashboard Overview
          </button>

          <button
            className={activePage === "notes" ? "active" : ""}
            onClick={() => setActivePage("notes")}
          >
            All Notes
          </button>

          <button
            className={activePage === "users" ? "active" : ""}
            onClick={() => setActivePage("users")}
          >
            User Management
          </button>
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="admin-main">

        <header className="admin-topbar">
          <h2>Admin Panel</h2>
          <span>{user.name}</span>
        </header>

        <section className="admin-content">

          {error && (
            <p className="admin-error">{error}</p>
          )}

          {activePage === "overview" && (
            <>
              <div className="admin-welcome">
                <h1>Welcome, {user.name}!</h1>
                <p>Manage your Notes Management System.</p>
              </div>

              <div className="admin-stats-grid">

                <div className="admin-stat-card">
                  <h3>Total Users</h3>
                  <p>{stats.totalUsers}</p>
                </div>

                <div className="admin-stat-card">
                  <h3>Total Notes</h3>
                  <p>{stats.totalNotes}</p>
                </div>

              </div>

              <div className="admin-recent-section">
                <h2>Recent Notes</h2>

                {recentNotes.length === 0 ? (
                  <p className="admin-empty">
                    No notes have been created yet.
                  </p>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Created By</th>
                          <th>Date</th>
                        </tr>
                      </thead>

                      <tbody>
                        {recentNotes.map((note) => (
                          <tr key={note._id}>
                            <td>{note.title}</td>
                            <td>{note.owner?.name || "Unknown"}</td>
                            <td>
                              {new Date(note.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {activePage === "notes" && (
            <div className="admin-recent-section">
              <h1>All Notes</h1>
              <p>View and manage notes created by all users.</p>

              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search notes by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <button type="submit">Search</button>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setNotesSearch("");
                  }}
                >
                  Clear
                </button>
              </form>

              {notesError && (
                <p className="admin-error">{notesError}</p>
              )}

              {notesLoading ? (
                <p>Loading notes...</p>
              ) : allNotes.length === 0 ? (
                <p className="admin-empty">
                  No notes found.
                </p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Content</th>
                        <th>Tags</th>
                        <th>Created By</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {allNotes.map((note) => (
                        <tr key={note._id}>
                          <td>{note.title}</td>
                          <td>{note.content}</td>
                          <td>
                            {note.tags?.length
                              ? note.tags.join(", ")
                              : "No tags"}
                          </td>
                          <td>
                            {note.owner?.name || "Unknown"}
                            <br />
                            {note.owner?.email || ""}
                          </td>
                          <td>
                            {new Date(note.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(note._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        {activePage === "users" && (
  <div className="admin-section">

    <div className="section-header">
      <div>
        <h2>User Management</h2>
        <p>View and search registered users.</p>
      </div>
    </div>

    <div className="users-toolbar">
      <input
        type="text"
        placeholder="Search users by name or email..."
        value={userSearch}
        onChange={(e) => setUserSearch(e.target.value)}
      />

      <span>
        Total Users: {users.length}
      </span>
    </div>

    {usersLoading ? (
      <p className="users-message">Loading users...</p>
    ) : usersError ? (
      <p className="users-error">{usersError}</p>
    ) : users.length === 0 ? (
      <p className="users-message">
        No registered users found.
      </p>
    ) : (
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Registered On</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-IN")
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

  </div>
)}

        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
