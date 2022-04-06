import React, { useEffect, useState } from "react";
import "./App.css";

type HeaderProps = {
    noOfDays: number;
};

type OneDayProgress = {
    type: "vacation" | "progress";
    name: string;
    date: number; // unix timestamp;
    color: string;
};

const daysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
};

const TableHeader = (props: HeaderProps) => {
    const [columns, setColumns] = useState<JSX.Element[]>([]);
    useEffect(() => {
        let cols = [];
        cols.push(<th>Project Name</th>);
        for (let i = 1; i <= props.noOfDays; i++) {
            cols.push(<th key={"headerColumn" + i}>{i}</th>);
        }

        setColumns(cols);
    }, [props.noOfDays]);

    return <tr>{columns}</tr>;
};

const Table = (props: HeaderProps) => {
    return (
        <table>
            <TableHeader noOfDays={props.noOfDays}></TableHeader>
        </table>
    );
};

const AddProject = () => {
    return <></>;
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
    return (
        <div className="App">
            <AddProject></AddProject>
            <Table noOfDays={31}></Table>
            <h6>
                Warning, deleting cookies will delete all of the data in here,
                so keep that in mind.
            </h6>
            <CopyDataToClipboard></CopyDataToClipboard>
        </div>
    );
};

export default App;
