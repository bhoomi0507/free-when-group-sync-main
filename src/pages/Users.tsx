import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
};

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const loadUsers = async () => {
    const res = await fetch(`${BASE_URL}/users`);
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async () => {
    await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email })
    });

    setName("");
    setEmail("");
    loadUsers();
  };

  const handleDelete = async (id: number) => {
    await fetch(`${BASE_URL}/users/${id}`, {
      method: "DELETE"
    });

    loadUsers();
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Users</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleCreate}>Add</button>
      </div>

      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} ({u.email})
            <button onClick={() => handleDelete(u.id)}> Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}