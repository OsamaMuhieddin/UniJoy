interface DataTableProps<T extends object> {
    headers: string[];
    data: T[];
    loading?: boolean;
}

export const DataTable = <T extends object>({ headers, data, loading }: DataTableProps<T>) => (
    <div className="overflow-x-auto">
        <table className="w-full">
            <thead>
                <tr className="border-b">
                    {headers.map((header) => (
                        <th key={header} className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr>
                        <td colSpan={headers.length} className="py-4 text-center text-gray-500">
                            Loading...
                        </td>
                    </tr>
                ) : (
                    data.map((row, index) => (
                        <tr key={index} className="border-b">
                            {Object.values(row).map((value, i) => (
                                <td key={i} className="py-3 px-4">
                                    {value}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);