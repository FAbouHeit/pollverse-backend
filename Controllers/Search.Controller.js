import User from "../Models/UserModel/User.Model.js";

export const search = async (req,res) =>{
    const { searchText} = req.body;
    // console.log("search text: ", searchText);
    try {
        // const searchText = req.params.searchText;
        // Using a regular expression to match the searchText against firstName or lastName
        const users = await User.find({
          $or: [
            { firstName: { $regex: searchText, $options: 'i' } }, // Case-insensitive match
            { lastName: { $regex: searchText, $options: 'i' } },
            { fullName: { $regex: searchText, $options: 'i' } } // In case you want to search by full name
          ]
        });
        
        res.json(users);
      } catch (error) {
        // console.error(error);
        res.status(500).json({ message: 'Server Error', error: error });
      }
}