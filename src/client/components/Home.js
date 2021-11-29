import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <div>Homepage</div>
            <Link to="/list">go to list</Link>
            <button onClick={() => console.log('click')}>click me</button>
        </div>
    );
};

export default Home;
