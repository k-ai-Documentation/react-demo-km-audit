import { useState } from "react";
import styles from "./../styles/DropdownSelect.module.scss";
import expend from "kai-asset/expend_more.svg"
import Image from "next/image";

interface DropdownSelectProps {
  selected: string;
  options: string[];
  onChange: (value: string) => void;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({ selected, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const [newSelected, setNewSelected] = useState(selected);
  return (
    <div className={`${styles["dropdown-select"]} ${isOpen ? styles["open"] : ""}`}>
      <div className={styles["trigger"]} onClick={() => setIsOpen(!isOpen)}>
        <p className="text-white text-medium-14">{newSelected}</p>
        <Image src={expend} alt="expend" width={24} height={24} />
      </div>
      {isOpen && (
        <div className={styles["body"]}>
          {options.map((option) =>
            option !== newSelected ? (
              <div key={option} className={styles["select-box"]} onClick={() => {onChange(option); setIsOpen(false); setNewSelected(option)}}>
                <p className="text-white text-medium-14">{option}</p>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
};

export default DropdownSelect;
