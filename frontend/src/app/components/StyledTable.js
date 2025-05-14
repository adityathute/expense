import "./../styles/table.css";

export default function StyledTable({ headers = [], rows = [], emptyText = "No entries found." }) {
    return (
        <table className="table">
            <thead>
                <tr>
                    {headers.map((header, index) => <th key={index}>{header}</th>)}
                </tr>
            </thead>
            <tbody>
                {rows.length ? (
                    rows
                ) : (
                    <tr>
                        <td colSpan={headers.length}>{emptyText}</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}
