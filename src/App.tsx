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
    props: HeaderProps &
        AddProjectProps & {
            active: boolean;
            color: string;
            date: string;
            projectName: string;
        }
) => {
    const [isInactivePeriod, setIsInactivePeriod] = useState(false);

    useEffect(() => {
        const data = props.data;
        const inactivePeriods = props.data.filter((v) => v.type === "vacation");
        setIsInactivePeriod(false);

        let index = 0;
        while (index < data.length) {
            if (
                data[index]?.name === props.projectName &&
                new Date(data[index]?.date || 0).getFullYear() ===
                    new Date(props.date || 0).getFullYear() &&
                new Date(data[index]?.date || 0).getMonth() ===
                    new Date(props.date || 0).getMonth() &&
                new Date(data[index]?.date || 0).getDate() ===
                    new Date(props.date || 0).getDate()
            ) {
                break;
            }
            index++;
        }

        for (let period of inactivePeriods) {
            if (period.startDate && period.endDate)
                if (
                    new Date(period.startDate) <= new Date(props.date) &&
                    new Date(period.endDate) >= new Date(props.date)
                ) {
                    setIsInactivePeriod(true);
                }
        }
    }, [props.date, props.projectName, props.data]);

    const activateSquare = () => {
        const data = props.data;
        let index = 0;
        while (index < data.length) {
            if (
                data[index]?.name === props.projectName &&
                new Date(data[index]?.date || 0).getFullYear() ===
                    new Date(props.date || 0).getFullYear() &&
                new Date(data[index]?.date || 0).getMonth() ===
                    new Date(props.date || 0).getMonth() &&
                new Date(data[index]?.date || 0).getDate() ===
                    new Date(props.date || 0).getDate()
            ) {
                break;
            }
            index++;
        }

        if (props.active) {
            const newData = data.filter((v, i) => i !== index);
            props.parentCallback(newData);
        } else {
            const newData = [
                ...data,
                {
                    name: props.projectName,
                    date: new Date(props.date).getTime(),
                    type: "progress",
                },
            ] as OneDayProgress[];
            props.parentCallback(newData);
        }
    };
    return (
        <div
            onClick={activateSquare}
            className={`square_${props.active ? "active" : "inactive"}`}
            style={{
                background: props.active
                    ? isInactivePeriod
                        ? `repeating-linear-gradient(
                    45deg,
                    ${props.color},
                    ${props.color} 4px,
                    #fff 4px,
                    #fff 8px
                  )`
                        : `${props.color}`
                    : "",
                border: `2px ${isInactivePeriod ? "dashed" : "solid"} ${
                    props.color
                }`,
            }}
        ></div>
    );
};

const matchDates = (
    year: number,
    month: number,
    day: number,
    dates: string[]
) => {
    if (!dates) return false;
    let match = false;
    for (let date of dates) {
        if (
            year === new Date(date).getFullYear() &&
            month === new Date(date).getMonth() &&
            day === new Date(date).getDate()
        ) {
            match = true;
        }
    }
    return match;
};

const TableBody = (
    props: HeaderProps & AddProjectProps & { month: number; year: number }
) => {
    const [rows, setRows] = useState<JSX.Element[]>([
        <tr key={"emptytr"}></tr>,
    ]);

    useEffect(() => {
        const projectColors = new Map();
        const projectDates = new Map();
        const vacations = [];

        for (let progress of props.data) {
            if (progress.type === "progress" && progress.name) {
                if (!projectColors.has(progress.name))
                    projectColors.set(progress.name, progress.color);
            } else {
                vacations.push([progress.startDate, progress.endDate]);
            }
        }
        for (let progress of props.data) {
            if (progress.type === "progress") {
                if (!projectDates.has(progress.name)) {
                    if (progress.date)
                        projectDates.set(progress.name, [progress.date]);
                } else {
                    const dates = projectDates.get(progress.name);
                    projectDates.delete(progress.name);
                    projectDates.set(progress.name, [...dates, progress.date]);
                }
            }
        }
        let rowees: JSX.Element[][] = [];
        let rowIndex = 0;

        projectColors.forEach((value, key) => {
            let row = [<td key={key}>{key}</td>];
            const dates = projectDates.get(key);

            for (let i = 1; i <= props.noOfDays; i++) {
                row.push(
                    <td key={`${key}${rowIndex}${i}`}>
                        <Square
                            key={`square${key}${rowIndex}${i}`}
                            active={matchDates(
                                props.year,
                                props.month - 1,
                                i,
                                dates
                            )}
                            projectName={key}
                            data={props.data}
                            noOfDays={props.noOfDays}
                            color={value}
                            date={new Date(
                                props.year,
                                props.month - 1,
                                i
                            ).toISOString()}
                            parentCallback={props.parentCallback}
                        ></Square>
                    </td>
                );
            }
            rowees[rowIndex] = row;

            rowIndex++;
        });

        setRows(rowees.map((i, ind) => <tr key={ind + "rowee"}>{i}</tr>));
    }, [
        props.data,
        props.noOfDays,
        props.parentCallback,
        props.month,
        props.year,
    ]);

    return <>{rows}</>;
};
const Table = (
    props: HeaderProps & AddProjectProps & { month: number; year: number }
) => {
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
                        month={props.month}
                        year={props.year}
                        data={props.data}
                        noOfDays={props.noOfDays}
                        parentCallback={props.parentCallback}
                    ></TableBody>
                </tbody>
            </table>
        </>
    );
};

type AddProjectProps = {
    parentCallback: (data: OneDayProgress[]) => void;
};

const randomColor = () =>
    "#" + Math.floor(Math.random() * 16777215).toString(16);

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

        if (projectType === "progress")
            setInfoMessage("Project added successfully.");
        else setInfoMessage("Period added successfully.");

        setInfoMessageType("success");

        setTimeout(() => {
            setInfoMessage("");
            setInfoMessageType("success");
        }, 2500);
    };

    const deleteProject = () => {
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
            if (!projectExists) {
                setInfoMessageType("error");
                setInfoMessage("Project doesn't exist.");
                return;
            }
            if (projectExists) {
                props.parentCallback(
                    data.filter((v) => v.name !== projectName)
                );

                setInfoMessageType("success");
                setInfoMessage("Project has been deleted.");
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
            props.parentCallback(
                data.filter(
                    (v) =>
                        new Date(v.startDate || 0).getTime() !==
                        new Date(vacationStart).getTime()
                )
            );
        }

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
                    <option value="vacation">Inactive Period</option>
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
                <button onClick={deleteProject}>Delete</button>
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
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    useEffect(() => {
        const data = window.localStorage.getItem("data");
        if (!data) window.localStorage.setItem("data", JSON.stringify([]));
        setData(
            JSON.parse(
                window.localStorage.getItem("data") || "[]"
            ) as OneDayProgress[]
        );
    }, []);

    const updateData = (d: OneDayProgress[]) => {
        setData(d);
        window.localStorage.setItem("data", JSON.stringify(d));
    };

    const incrementMonth = () => {
        if (month === 12) {
            setMonth(1);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    };
    const decrementMonth = () => {
        if (month === 1) {
            setMonth(12);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    };

    return (
        <div className="App">
            <div>
                <div>{new Date(year, month, 0).toLocaleDateString()}</div>
                <button onClick={decrementMonth}>Previous Month</button>
                <button onClick={incrementMonth}>Next Month</button>
            </div>
            <Table
                month={month}
                year={year}
                noOfDays={daysInMonth(month, year)}
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
