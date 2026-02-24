import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  function register(email, password, userData, isAdmin, adminPassword) {
    // Verify admin password if trying to register as admin
    // Admin password should be set in environment variable REACT_APP_ADMIN_PASS for security
    const expectedAdminPass = process.env.REACT_APP_ADMIN_PASS || "TEMPORARY_UNSECURE_DEFAULT";

    if (isAdmin && adminPassword !== expectedAdminPass) {
      return Promise.reject(new Error("Invalid admin password"));
    }

    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Store user data in Firestore
        const user = userCredential.user;
        const role = isAdmin ? "admin" : "user";

        await setDoc(doc(db, "users", user.uid), {
          ...userData,
          email: email,
          role: role,
          createdAt: new Date().toISOString()
        });

        return userCredential;
      });
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }
  // function Login() {
  //   return (
  //     <div className="auth-form-container">
  //       <h2 className="auth-form-title">Login</h2>
  //       <p>This is a test login page</p>
  //       <form className="auth-form">
  //         <div className="form-group">
  //           <label htmlFor="email">Email</label>
  //           <input
  //             type="email"
  //             id="email"
  //             className="form-control"
  //             required
  //           />
  //         </div>

  //         <div className="form-group">
  //           <label htmlFor="password">Password</label>
  //           <input
  //             type="password"
  //             id="password"
  //             className="form-control"
  //             required
  //           />
  //         </div>

  //         <button 
  //           type="submit" 
  //           className="btn"
  //         >
  //           Login
  //         </button>
  //       </form>

  //       <div className="auth-links">
  //         <p>
  //           <a href="/forgot-password">Forgot Password?</a>
  //         </p>
  //         <p>
  //           Don't have an account? <a href="/register">Register</a>
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }
  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  async function getUserRole(uid) {
    if (!uid) return null;

    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data().role;
      }
      return null;
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        const role = await getUserRole(user.uid);
        setUserRole(role);
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    register,
    login,
    logout,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}