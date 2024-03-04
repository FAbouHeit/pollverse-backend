import mongoose from 'mongoose';
import User from '../Models/UserModel/User.Model.js';

export const getUserById = async (id) => {
    // Check if the id is valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid user ID format');
    }
  
    // Create ObjectId from the string id using the recommended method
    const objectId = mongoose.Types.ObjectId.createFromTime(id);
  
    // Find the user by the ObjectId
    try {
      const user = await User.findById(objectId);
      return user;
    } catch (error) {
        console.log("error: ", error);
      throw new Error('Error fetching user', error);
    }
  }

// Example usage:
getUserById('65e5ab61f67531c69f8ecfe1')
  .then(user => {
    console.log(user);
  })
  .catch(error => {
    console.error(error.message);
  });
