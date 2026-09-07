import './ToggleSwitch.css';

interface ToggleProps {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const ToggleSwitch = ({ isChecked, onChange, label }: ToggleProps) => {
  return (
    <label className="toggle-container">
      {label && <span className="toggle-label">{label}</span>}
      <div className="switch">
        <input 
          type="checkbox" 
          checked={isChecked} 
          onChange={(e) => onChange(e.target.checked)} 
        />
        <span className="slider" />
      </div>
    </label>
  );
};