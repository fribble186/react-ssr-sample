import React, {useEffect} from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { fetchUsers } from '../store/users/users.actions';

const UserList = () => {
    const users = useSelector((state) => state.users);
    const dispatch = useDispatch();
    useEffect(() => dispatch(fetchUsers()), []);
    return (
        <div>
            <div>UserList</div>
            <Link to="/">go to Home</Link>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.first_name}</li>
                ))}
            </ul>
        </div>
    );
};

UserList.getInitialData = (store) => {
    return store.dispatch(fetchUsers());
}

export default UserList;
