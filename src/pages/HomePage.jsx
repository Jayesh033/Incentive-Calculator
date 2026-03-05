import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/homepage.css';
import logo from '../assets/images/bajaj-logo.png';

export default function HomePage() {
    const navigate = useNavigate();
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [activeMonthBtn, setActiveMonthBtn] = useState('');
    const [activeTeamBtn, setActiveTeamBtn] = useState('');

    useEffect(() => {
        const interval = setInterval(createMoney, 200);
        return () => clearInterval(interval);
    }, []);

    function createMoney() {
        const money = document.createElement("div");
        money.classList.add("money");
        money.innerHTML = "&#8377;";
        money.style.left = Math.random() * window.innerWidth + "px";
        money.style.animationDuration = (4 + Math.random() * 4) + "s";
        money.style.fontSize = (18 + Math.random() * 22) + "px";
        document.body.appendChild(money);
        setTimeout(() => { money.remove(); }, 8000);
    }

    function selectMonth(month) {
        setSelectedMonth(month);
        setSelectedTeam('');
        setActiveMonthBtn(month);
        setActiveTeamBtn('');
    }

    function selectTeam(team) {
        setSelectedTeam(team);
        setActiveTeamBtn(team);
    }

    function getCalculatorOptions() {
        if (selectedMonth === "Jan" && selectedTeam === "Term") {
            return ["SM-BFL", "SM-BAU", "Outsource-BFL", "Outsource-BAU"];
        }
        if (selectedMonth === "Jan" && selectedTeam === "NonTerm") {
            return ["BFL", "BAU"];
        }
        if (selectedMonth === "Feb" && selectedTeam === "Term") {
            return ["BFL", "BAU"];
        }
        if (selectedMonth === "Feb" && selectedTeam === "NonTerm") {
            return ["BFL", "BAU"];
        }
        return [];
    }

    function redirectToCalculator(option) {
        if (selectedMonth === "Feb" && selectedTeam === "Term") {
            navigate(`/calculator/feb/term/${option}`);
        } else if (selectedMonth === "Feb" && selectedTeam === "NonTerm") {
            navigate(`/calculator/feb/nonterm/${option}`);
        } else if (selectedMonth === "Jan" && selectedTeam === "Term") {
            if (option.startsWith("SM")) {
                const type = option === "SM-BFL" ? "SM_BFL" : "SM_BAU";
                navigate(`/calculator/jan/term/sm/${type}`);
            } else if (option.startsWith("Outsource")) {
                const type = option === "Outsource-BFL" ? "OUTSOURCE_BFL" : "OUTSOURCE_BAU";
                navigate(`/calculator/jan/term/outsource/${type}`);
            }
        } else if (selectedMonth === "Jan" && selectedTeam === "NonTerm") {
            navigate(`/calculator/jan/nonterm/${option}`);
        }
    }

    const calcOptions = getCalculatorOptions();

    return (
        <div className="homepage-wrapper">
            <div className="container">
                <img src={logo} className="logo" alt="Bajaj Logo" />

                {/* MONTH SECTION */}
                <div id="monthSection">
                    <h2>Select Month</h2>
                    <div className="button-row">
                        <button
                            onClick={() => selectMonth('Jan')}
                            className={`choice-btn ${activeMonthBtn === 'Jan' ? 'active' : ''}`}
                        >
                            Jan'26
                        </button>
                        <button
                            onClick={() => selectMonth('Feb')}
                            className={`choice-btn ${activeMonthBtn === 'Feb' ? 'active' : ''}`}
                        >
                            Feb'26
                        </button>
                    </div>
                </div>

                {/* TEAM SECTION */}
                {selectedMonth && (
                    <div id="teamSection">
                        <h2>Select Team</h2>
                        <div className="button-row">
                            <button
                                onClick={() => selectTeam('Term')}
                                className={`choice-btn ${activeTeamBtn === 'Term' ? 'active' : ''}`}
                            >
                                Term
                            </button>
                            <button
                                onClick={() => selectTeam('NonTerm')}
                                className={`choice-btn ${activeTeamBtn === 'NonTerm' ? 'active' : ''}`}
                            >
                                Non-Term
                            </button>
                        </div>
                    </div>
                )}

                {/* CALCULATOR SECTION */}
                {selectedTeam && (
                    <div id="calculatorSection">
                        <h2>Select Calculator</h2>
                        <div className="button-row" id="calculatorButtons">
                            {calcOptions.map(option => (
                                <button
                                    key={option}
                                    className="choice-btn"
                                    onClick={() => redirectToCalculator(option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
