import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/fr";
dayjs.locale("fr");
import Translate from "./Translate";

export const Calendar = ({ selectedDate, onDateChange, reservations }) => {
    const [currentMonth, setCurrentMonth] = useState(dayjs());
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'fr');
    const isArabic = language === 'ar';

    useEffect(() => {
        localStorage.setItem("language", language);
    }, [language]);

    const handlePrevMonth = () => {
        setCurrentMonth(currentMonth.subtract(1, "month"));
    };

    const handleNextMonth = () => {
        setCurrentMonth(currentMonth.add(1, "month"));
    };

    const isSelected = (day) => {
        const dateToCheck = dayjs(currentMonth.format("YYYY-MM") + "-" + day);
        return dateToCheck.isSame(selectedDate, 'day');
    };

    const daysInMonth = currentMonth.daysInMonth();
    const firstDayOfMonth = currentMonth.startOf("month").day();

    const isReserved = (day) => {
        return reservations.some(reservation => {
            const reservationDate = dayjs(reservation.date);
            const dateToCheck = dayjs(currentMonth.format("YYYY-MM") + "-" + day);
            return reservationDate.isSame(dateToCheck, 'day');
        });
    };

    
    return (
        <div className="calendar">
            <div className="calendar-header">
                <button onClick={handlePrevMonth}>&lt;</button>
                <span>{currentMonth.format("MMMM YYYY")}</span>
                <button onClick={handleNextMonth}>&gt;</button>
            </div>
            <div className="calendar-grid">
                <div className="calendar-day-names">
                    {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
                        <div key={day} className="day-name"><Translate textKey={day} /></div>
                    ))}
                </div>
                <div className="calendar-days">
                    {Array(firstDayOfMonth).fill(null).map((_, i) => (
                        <div key={i} className="calendar-day empty"></div>
                    ))}
                    {Array(daysInMonth).fill(null).map((_, i) => {
                        const day = i + 1;
                        return (
                            <div
                                key={day}
                                className={`calendar-day ${isReserved(day) ? 'reserved' : ''} ${isSelected(day) ? 'selected' : ''}`}
                                onClick={() => onDateChange(dayjs(currentMonth.format("YYYY-MM") + "-" + day))}
                            >
                                {day}
                            </div>
                        );
                    })}
                </div>

            </div>

            <style jsx>{`
                .calendar {
                    width: 100%; 
                    max-width: ${isArabic ? '500px' : '300px'}; 
                    border: 1px solid #ccc;
                    font-family: sans-serif;
                    margin: 0 auto; 
                }

                .calendar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    padding: 10px;
                    background-color: #f0f0f0;
                }

                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr); 
                }

                .calendar-day-names {
                    display: contents;
                    font-weight: bold;
                    padding: 5px;
                    text-align: center;
                }

                .day-name { 
                    padding: 5px; 
                }

                .calendar-days {
                    display: contents;
                }

                .calendar-day {
                    padding: 10px;
                    text-align: center;
                    border: 1px solid #eee;
                    cursor: pointer;
                    box-sizing: border-box; 
                    ${isArabic ? 'width: 40px; height: 40px; display: flex; justify-content: flex-end; align-items: flex-end;' : ''}
                }

                .calendar-day.empty {
                    border: none;
                    cursor: default;
                    ${isArabic ? 'width: 40px; height: 40px;' : ''}
                }

                .calendar-day.selected {
                    background-color: lightblue;
                }

                .calendar-day.reserved {
                    background-color: red; 
                    border-radius: 50%; 
                }

                @media (max-width: 400px) {
                    .calendar {
                        font-size: 14px;
                    }
                    .calendar-day {
                        padding: 5px; 
                        ${isArabic ? 'width: 30px; height: 30px;' : ''} 
                    }
                    .calendar-day.empty {
                        ${isArabic ? 'width: 30px; height: 30px;' : ''} 
                    }
                }
            `}</style>
        </div>
    );
};
