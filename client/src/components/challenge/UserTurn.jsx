import React from 'react';
import MicrophoneSVG from '../svgs/MicrophoneSVG';

const UserTurn = ({ user, onStart }) => {
  return (
    <div className="text-center py-6">
      <h2 className="text-3xl font-bold text-indigo-700 mb-6 animate-fadeIn">
        Player {user}'s Turn
      </h2>
      
      <div className="flex justify-center mb-6">
        <MicrophoneSVG size={100} />
      </div>
      
      <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
        Get ready to sing! When you're ready, click the button below.
      </p>
      <button 
        onClick={onStart}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
      >
        I'm Ready!
      </button>
    </div>
  );
};

export default UserTurn;
