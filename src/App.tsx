import React, { useEffect, useState } from "react";
import "./App.css";

type HeaderProps = {
    noOfDays: number;
};

type OneDayProgress = {
    type: "vacation" | "progress";
    name?: string;
    date?: number; // unix timestamp;
    startDate?: number;
    endDate?: number;
    color: string;
};

const daysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
};

const TableHeader = (props: HeaderProps) => {
    const [columns, setColumns] = useState<JSX.Element[]>([]);
    useEffect(() => {
        let cols = [];
        cols.push(<th key={"headerColumnProjectName"}>Project Name</th>);
        for (let i = 1; i <= props.noOfDays; i++) {
            cols.push(<th key={"headerColumn" + i}>{i}</th>);
        }

        setColumns(cols);
    }, [props.noOfDays]);

    return <tr>{columns}</tr>;
};

const Table = (props: HeaderProps) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        setData(JSON.parse(window.localStorage.getItem("data") || "[]"));

        console.log(data);
    }, [props.noOfDays]);

    return (
        <table>
            <thead>
                <TableHeader noOfDays={props.noOfDays}></TableHeader>
            </thead>
        </table>
    );
};

const AddProject = () => {
    const [projectName, setProjectName] = useState<string>("");
    const [projectColor, setProjectColor] = useState<string>("");
    const [vacationStart, setVacationStart] = useState<string>("");
    const [vacationEnd, setVacationEnd] = useState<string>("");
    const [projectType, setProjectType] = useState<string>("progress");
    const [infoMessage, setInfoMessage] = useState<string>("");
    const [infoMessageType, setInfoMessageType] = useState<"success" | "error">(
        "success"
    );

    useEffect(() => {}, []);

    const addProject = () => {
        const data = JSON.parse(
            window.localStorage.getItem("data") || ""
        ) as Array<OneDayProgress>;

        // check if project already exists
        // check if the name is empty
        // check the type
        // validate vacation start and vacation end
        console.log(
            projectName,
            projectColor,
            vacationStart,
            vacationEnd,
            projectType
        );

        if (projectType === "progress") {
            let projectExists = false;
            if (!projectName) {
                setInfoMessageType("error");
                setInfoMessage("Project name cannot be empty.");
                return;
            }
            for (let i of data) {
                if (i.name === projectName) projectExists = true;
            }
            if (projectExists) {
                setInfoMessageType("error");
                setInfoMessage("Project name already exists.");
                return;
            }
            if (!projectColor) {
                var randomColor = Math.floor(Math.random() * 16777215).toString(
                    16
                );
                setProjectColor(randomColor);
            }
        } else {
            if (!vacationStart) {
                setInfoMessageType("error");
                setInfoMessage("Start date cannot be empty.");
                return;
            }
            if (!vacationEnd) {
                setInfoMessageType("error");
                setInfoMessage("End date cannot be empty.");
                return;
            }
            if (!new Date(vacationStart).getTime()) {
                setInfoMessageType("error");
                setInfoMessage("Invalid start date.");
                return;
            }
            if (!new Date(vacationEnd).getTime()) {
                setInfoMessageType("error");
                setInfoMessage("Invalid end date.");
                return;
            }
            if (
                new Date(vacationEnd).getTime() <
                new Date(vacationStart).getTime()
            ) {
                setInfoMessageType("error");
                setInfoMessage("End date cannot be before the start date.");
                return;
            }
        }
        if (projectType === "progress") {
            window.localStorage.setItem(
                "data",
                JSON.stringify([
                    ...data,
                    {
                        name: projectName,
                        type: projectType,
                        color: projectColor,
                    },
                ])
            );
        } else {
            window.localStorage.setItem(
                "data",
                JSON.stringify([
                    ...data,
                    {
                        type: projectType,
                        startDate: new Date(vacationStart).getTime(),
                        startEnd: new Date(vacationEnd).getTime(),
                    },
                ])
            );
        }

        setInfoMessage("Project added successfully.");
        setInfoMessageType("success");

        setTimeout(() => {
            setInfoMessage("");
            setInfoMessageType("success");
        }, 2500);
    };

    return (
        <>
            <div className="AddData">
                <select
                    onChange={(e) => setProjectType(e.currentTarget.value)}
                    name="type"
                >
                    <option value="progress">Project</option>
                    <option value="vacation">Empty Period</option>
                </select>
                <div
                    className="ProjectInput"
                    hidden={projectType === "vacation"}
                >
                    <input
                        type="text"
                        placeholder="Name"
                        onChange={(e) => setProjectName(e.currentTarget.value)}
                    />
                    <input
                        type="text"
                        placeholder="Hex Color (optional)"
                        onChange={(e) => setProjectColor(e.currentTarget.value)}
                    />
                </div>
                <div
                    className="VacationInput"
                    hidden={projectType === "progress"}
                >
                    <input
                        type="text"
                        placeholder="Start Date"
                        onChange={(e) =>
                            setVacationStart(e.currentTarget.value)
                        }
                    />
                    <input
                        type="text"
                        placeholder="End Date"
                        onChange={(e) => setVacationEnd(e.currentTarget.value)}
                    />
                </div>
                <button onClick={addProject}>Add</button>
            </div>
            <div className={"infoMessage" + infoMessageType}>{infoMessage}</div>
        </>
    );
};

const CopyDataToClipboard = () => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const data = window.localStorage.getItem("data");
        if (!data) window.localStorage.setItem("data", JSON.stringify([]));
    });

    const copyData = () => {
        const Data = window.localStorage.getItem("data");
        navigator.clipboard.writeText(JSON.stringify(Data));
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2500);
    };

    return (
        <button
            onClick={copyData}
            className={"CopyButton " + copied ? "copied" : "notcopied"}
        >
            {copied ? "Data Has Been Copied" : "Copy Data To Clipboard"}
        </button>
    );
};

const App = () => {
    return (
        <div className="App">
            <Table noOfDays={31}></Table>
            <div className="PageHeader">
                <AddProject></AddProject>
                <CopyDataToClipboard></CopyDataToClipboard>
            </div>
            <h6>
                Warning, deleting cookies will delete all of the data in here,
                so keep that in mind.
            </h6>
        </div>
    );
};

export default App;
