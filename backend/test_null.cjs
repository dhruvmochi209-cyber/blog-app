const mongoose = require('mongoose');
require('dotenv').config();

async function checkNull() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require('./src/models/User.model.js').default;
  const users = await User.find({ bookmarks: null });
  const usersWithNullElements = await User.find({ bookmarks: { $elemMatch: { $eq: null } } });
  
  console.log('Users with bookmarks field null:', users.length);
  console.log('Users with null in bookmarks array:', usersWithNullElements.length);
  
  for (let u of usersWithNullElements) {
    console.log('User has null in bookmarks. Fixing...');
    u.bookmarks = u.bookmarks.filter(id => id != null);
    await u.save();
  }

  process.exit(0);
}

checkNull().catch(console.error);
