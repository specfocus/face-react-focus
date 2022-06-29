import React from 'react';
import { useState } from 'react';

const styles = {
  root: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as 'column',
    fontFamily: '"Roboto", sans-serif',
  },
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as 'center',
    flexDirection: 'column' as 'column',
    background:
      'linear-gradient(135deg, #00023b 0%, #00023b 50%, #313264 100%)',
    color: 'white',
    fontSize: '1.5em',
    fontWeight: 'bold' as 'bold',
  },
  secondary: {
    height: '20vh',
    background: '#e8e8e8',
    color: 'black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  link: {
    textAlign: 'center' as 'center',
    width: 150,
    display: 'block',
    textDecoration: 'none',
    color: 'black',
    opacity: 0.7,
  },
  linkHovered: {
    opacity: 1,
  },
  image: {
    width: 50,
  },
  logo: {
    height: 100,
  },
};

const Button = ({ img, label, href }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div>
      <a
        href={href}
        style={
          hovered
            ? { ...styles.link, ...styles.linkHovered }
            : styles.link
        }
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img src={img} alt={label} style={styles.image} />
        <br />
        {label}
      </a>
    </div>
  );
};

export const Ready = () =>
  process.env.NODE_ENV === 'production' ? (
    <span />
  ) : (
    <div style={styles.root}>
      <div style={styles.main}>
        <h1>This is a template</h1>
        <div>
          Your application is properly configured.
          <br />
          Now you can add a &lt;Resource&gt; as child of
          &lt;Application&gt;.
        </div>
      </div>
    </div>
  );
