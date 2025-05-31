import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from "./AuthUser.module.css";
import { Mail, Lock, LockKeyhole } from 'lucide-react'; 
import google from "../../../public/googleicon.svg";



export default function AuthUser() {
  const {role} = useParams(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [toggled, setToggled] = useState(false);

  const [roleActual,setRole] = useState(role)

  const [admin,setAdmin] = useState(false);

  // Switch as an extra (nested) component
  const Switch = ({ checked, onChange, disabled, show }) => {
  // Usar bloque de función para evaluaciones antes del return
  if (!show) {
    return null;
  }

  return (
    <label className={styles.switch}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className={styles.slider} />
      <span className={styles.labelText}>Soy monitor</span>
    </label>
  );
};

useEffect(() => {
    if(role=="universidad"){
      setAdmin(true)
    }
  }, []);
 
  const isLoginMode = true;

  function onChangeSwitch(){
    setToggled(prev => !prev)
    toggled ? setRole("universidad") : setRole("monitor")
    
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Authentication or registration logic would go here
    console.log(isLoginMode ? "Login" : "Register", role, { email, password });
    // Example: navigate(`/${role}/dashboard`); after successful login
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.formSide}>
        <div className={styles.formContent}>
          <h1 className={styles.logoText}>Ugüee</h1>
          <p className={styles.tagline}>De casa a clase sin complicaciones</p>

          <div className={styles.authCard}>
            <h2 className={styles.formTitle}>
              Iniciar Sesión como {roleActual}
            </h2>

            <form onSubmit={handleSubmit} className={styles.authForm}>
              <div className={styles.inputGroup}>
                <Mail className={styles.icon} size={20} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputGroup}>
                <LockKeyhole className={styles.icon} size={20} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  required
                  className={styles.inputField}
                />
              </div>

              <Switch
              checked={toggled}
              onChange={() => onChangeSwitch()}
              disabled={false}
              show={admin}
              />



              <Link to={`/${roleActual}`} >
              <button type="submit" className={styles.submitButton}>
                Iniciar Sesión
              </button>
              </Link>
              <button type="button" className={styles.googleButton}>
                <img src={google} alt="" className={styles.googleIconPlaceholder} width={20} height={20}/>
                Iniciar sesión con Google
              </button>

              {isLoginMode && (
                <div className={styles.forgotPasswordContainer}>
                  <a href="#" className={styles.forgotPasswordLink}>
                    Olvidé mi contraseña
                  </a>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      <div className={styles.imageSide}>
        
      </div>
    </div>
  );
}
