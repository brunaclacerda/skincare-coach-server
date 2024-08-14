import User from "./user.model.js";

export async function newUser(input) {
    const user = new User(input);

    return await user.save();
}

export async function updateUser(input, userID) {
    const updates = Object.keys(input);
    const updatesAllowed = [
        "name",
        "email",
        "password",
        "birthDate",
        "skinType",
        "concern",
    ];
    const isValidOperation = updates.every((update) =>
        updatesAllowed.includes(update)
    );

    if (!isValidOperation) {
        throw new Error("Invalid update!");
    }

    const user = await User.findOne({ _id: userID });
    if (!user) {
        return undefined;
    }

    updates.forEach((element) => (user[element] = input[element]));
    return await user.save();
}

// function verify(username, password, cb) {
//     db.get('SELECT * FROM users WHERE username = ?', [ username ], function(err, row) {
//       if (err) { return cb(err); }
//       if (!row) { return cb(null, false, { message: 'Incorrect username or password.' }); }

//       crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
//         if (err) { return cb(err); }
//         if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
//           return cb(null, false, { message: 'Incorrect username or password.' });
//         }
//         return cb(null, row);
//       });
//     });
//   };

export async function verify(email, password, cb) {
    try {
        const user = await User.findByCredential(email, password);

        if (user) {
            cb(null, user);
        } else {
            cb(null, false, {
                message: "Incorrect username or password.",
            });
        }
    } catch (error) {
        cb(error);
    }
}
