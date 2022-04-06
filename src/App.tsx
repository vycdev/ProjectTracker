import React, { useEffect, useState } from "react";
import "./App.css";
// Month in JavaScript is 0-indexed (January is 0, February is 1, etc),
// but by using 0 as the day it will give us the last day of the prior
// month. So passing in 1 as the month number will return the last day
// of January, not February
const daysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
};

// July
daysInMonth(7, 2009); // 31
// February
daysInMonth(2, 2009); // 28
daysInMonth(2, 2008); // 29

type HeaderProps = {
    noOfDays: number;
};

const TableHeader = (props: HeaderProps) => {
    const [columns, setColumns] = useState<JSX.Element[]>([]);
    useEffect(() => {
        let cols = [];
        for (let i = 1; i <= props.noOfDays; i++) {
            cols.push(<th key={"headerColumn" + i}>{i}</th>);
        }

        setColumns(cols);
    }, [props.noOfDays]);

    return <tr>{columns}</tr>;
};

const Table = () => {
    // tr th
    // tr td
};
const App = () => {
    return (
        <div className="App">
            <table>
                <TableHeader noOfDays={31}></TableHeader>
            </table>
        </div>
    );
};

export default App;
