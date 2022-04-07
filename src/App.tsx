import React, { useEffect, useState } from "react";
import "./App.css";

type HeaderProps = {
    noOfDays: number;
    data: OneDayProgress[];
};

type OneDayProgress = {
    type: "vacation" | "progress";
    name?: string;
    date?: number; // unix timestamp;
    startDate?: number;
    endDate?: number;
    color?: string;
};

// 3 hours 20 minutes
// Add names to vacationss
// ADD a way to delete projects and vacations

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
const Square = (
    props: AddProjectProps & { active: boolean; color: string }
) => {
    return (
        <div
            className={`square_${props.active ? "active" : "inactive"}`}
            style={{
                backgroundColor: props.active ? `#${props.color}` : "",
                border: `1px solid #${props.color}`,
            }}
        ></div>
    );
};

const TableBody = (props: HeaderProps & AddProjectProps) => {
    const [rows, setRows] = useState<JSX.Element[]>([<tr></tr>]);

    useEffect(() => {
        const projectNames = new Map();
        const vacations = [];

        for (let progress of props.data) {
            if (progress.type === "progress" && progress.name) {
                if (!projectNames.has(progress.name))
                    projectNames.set(progress.name, progress.color);
            } else {
                vacations.push([progress.startDate, progress.endDate]);
            }
        }
        let rowees: JSX.Element[][] = [];
        let rowIndex = 0;

        projectNames.forEach((value, key) => {
            let row = [<td key={key}>{key}</td>];
            for (let i = 1; i <= props.noOfDays; i++) {
                row.push(
                    <td key={`${key}${rowIndex}${i}`}>
                        <Square
                            active={false}
                            color={value}
                            parentCallback={props.parentCallback}
                        ></Square>
                    </td>
                );
            }
            rowees[rowIndex] = row;

            rowIndex++;
        });

        setRows(rowees.map((i, ind) => <tr key={ind + "rowee"}>{i}</tr>));

        console.log(projectNames);
        console.log(vacations);
        console.log("rowees", rowees);
    }, [props.data, props.noOfDays, props.parentCallback]);

    return <>{rows} </>;
};
const Table = (props: HeaderProps & AddProjectProps) => {
    return (
        <>
            <table>
                <thead>
                    <TableHeader
                        noOfDays={props.noOfDays}
                        data={props.data}
                    ></TableHeader>
                </thead>
                <tbody>
                    <TableBody
                        data={props.data}
                        noOfDays={props.noOfDays}
                        parentCallback={props.parentCallback}
                    ></TableBody>
                </tbody>
            </table>
            {JSON.stringify(props.data)}
        </>
    );
};

type AddProjectProps = {
    parentCallback: (data: OneDayProgress[]) => void;
};

const randomColor = () => Math.floor(Math.random() * 16777215).toString(16);

const AddProject = (props: AddProjectProps) => {
    const [projectName, setProjectName] = useState<string>("");
    const [projectColor, setProjectColor] = useState<string>("");
    const [vacationStart, setVacationStart] = useState<string>("");
    const [vacationEnd, setVacationEnd] = useState<string>("");
    const [projectType, setProjectType] = useState<string>("progress");
    const [infoMessage, setInfoMessage] = useState<string>("");
    const [infoMessageType, setInfoMessageType] = useState<"success" | "error">(
        "success"
    );

    const addProject = () => {
        const data = JSON.parse(
            window.localStorage.getItem("data") || ""
        ) as Array<OneDayProgress>;

        if (projectType === "progress") {
            let projectExists = false;
            if (!projectName) {
                setInfoMessageType("error");
                setInfoMessage("Project name cannot be empty.");
                return;
            }
            if (projectName.length > 25) {
                setInfoMessageType("error");
                setInfoMessage(
                    "Project name cannot be more than 25 characters long."
                );
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
            setProjectColor(randomColor());
            props.parentCallback([
                ...data,
                {
                    name: projectName,
                    type: projectType,
                    color: projectColor ? projectColor : randomColor(),
                },
            ]);
        } else {
            props.parentCallback([
                ...data,
                {
                    type: projectType as "vacation" | "progress",
                    startDate: new Date(vacationStart).getTime(),
                    endDate: new Date(vacationEnd).getTime(),
                },
            ]);
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
    const [data, setData] = useState<OneDayProgress[]>([]);

    useEffect(() => {
        const data = window.localStorage.getItem("data");
        if (!data) window.localStorage.setItem("data", JSON.stringify([]));
        setData(
            JSON.parse(
                window.localStorage.getItem("data") || "[]"
            ) as OneDayProgress[]
        );

        console.log(
            JSON.parse(
                window.localStorage.getItem("data") || "[]"
            ) as OneDayProgress[]
        );
    }, []);

    const updateData = (d: OneDayProgress[]) => {
        setData(d);
        window.localStorage.setItem("data", JSON.stringify(d));
    };

    return (
        <div className="App">
            <Table
                noOfDays={31}
                data={data}
                parentCallback={updateData}
            ></Table>
            <div className="PageHeader">
                <AddProject parentCallback={updateData}></AddProject>
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
