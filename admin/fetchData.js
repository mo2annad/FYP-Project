async function fetchUsers() {
    try {
        const response = await fetch('http://localhost:5000/api/users');
        const users = await response.json();
        console.log(users);
        // Update the UI with user data
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

fetchUsers(); 