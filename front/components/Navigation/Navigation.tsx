import React from 'react';
import Link from "next/link";

const Navigation = () => {
    return (
        <ul>
            <li>
                <Link href={'/one2one'}>One to One VideoChat</Link>
            </li>
        </ul>
    );
};

export default React.memo(Navigation);