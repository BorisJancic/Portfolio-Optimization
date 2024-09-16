import { useEffect, useState } from 'react';
import './DarkModeSelector.css'

const DarkModeSelector = (props) => {
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
      setDarkMode(props.darkMode);
  }, [props.darkMode]);

    return (
        <div>
            <label className="switch">
            <input
                type="checkbox"
                id="toggle"
                checked={darkMode}
                onChange={() => { props.recvDarkMode(!props.darkMode); }}
            />
            <span className='slider round' htmlFor="toggle">
              <span className="night_sky" style={{width:'45px',height: '45px',left: '11px',bottom: '-10px', backgroundColor:'#292c45'}}/>
              <span className="night_sky" style={{width:'38px',height: '38px',left: '10px',bottom: '-7px', backgroundColor:'#35374a'}}/>
              <span className="night_sky" style={{width:'30px',height: '30px',left: '9px',bottom: '-3px', backgroundColor:'#4c4d59'}}/>
              <span className="night_sky" style={{width:'16px',height: '16px',left: '12px',bottom: '4px',backgroundColor:'#f7f7f7',boxShadow: '0 0 1px 1px rgba(255, 255, 255, 0.4)'}}/>
              <span className="moon_crater" style={{width:'6px',height: '6px',left: '9px',bottom: '9px',}}/>
              <span className="moon_crater" style={{width:'1px',height: '1px',left: '10px',bottom: '13px',backgroundColor:'#f7f7f7',boxShadow:'inset 0 0 2px rgba(0, 0, 0, 0)'}}/>
              <span className="moon_crater" style={{width:'2px',height: '2px',left: '16px',bottom: '7px',}}/>
              <span className="moon_crater" style={{width:'3px',height: '3px',left: '15px',bottom: '10px',}}/>
              <span className="star" style={{left:'20px',bottom: '18px'}}/>
              <span className="star" style={{left:'30px',bottom: '14px'}}/>
              <span className="star" style={{left:'40px',bottom: '15.5px'}}/>
              <span className="star" style={{width:'4px',height: '0.5px',left:'40px',bottom: '17px'}}/>
              <span className="star" style={{width:'0.5px',height: '4px',left:'40px',bottom: '13.5px'}}/>
              <span className="star" style={{left:'35px',bottom: '7.5px'}}/>
              <span className="star" style={{width:'5px',height: '0.5px',left:'35px',bottom: '9px'}}/>
              <span className="star" style={{width:'0.5px',height: '5px',left:'35px',bottom: '4.5px'}}/>
              <span className="star" style={{width:'4px',height: '1px',left:'24px',bottom: '6px'}}/>
              <span className="star" style={{width:'1px',height: '4px',left:'24px',bottom: '3px'}}/>

              <span className="sky_" style={{width:'45px',height: '45px',left: '11px',bottom: '-11px',backgroundColor:'#A3D5FB'}}/>
              <span className="sky_" style={{width:'38px',height: '38px',left: '16px',bottom: '-7px',backgroundColor:'#B5DDFC'}}/>
              <span className="sky_" style={{width:'30px',height: '30px',left: '21px',bottom: '-3px',backgroundColor:'#C8E6FD'}}/>
              <span className="sky_" style={{width:'16px',height: '16px',left: '25px',bottom: '4px',backgroundColor:'#f3e73f', boxShadow: '0 0 1px 1px #faf6b7'}}/>
             
              <span className="cloud" style={{width:'5px',height: '5px',left:'15px',bottom: '6px'}}/>
              <span className="cloud" style={{width:'7px',height: '8px',left:'18px',bottom: '5px',backgroundColor:'#f2f2f2'}}/>
              <span className="cloud" style={{width:'16px',height: '6px',left:'11px',bottom: '3px',backgroundColor:'#f7f7f7'}}/>

              <span className="cloud" style={{width:'10px',height: '10px',left:'-1px',bottom: '-5px',backgroundColor:'#f7f7f7'}}/>
              <span className="cloud" style={{width:'10px',height: '10px',left:'-9px',bottom: '-1px',backgroundColor:'#f7f7f7'}}/>
              <span className="cloud" style={{width:'16px',height: '16px',left:'-9px',bottom: '-9px',backgroundColor:'#f2f2f2'}}/>
            </span>
          </label>
        </div>
    )
}
export default DarkModeSelector;