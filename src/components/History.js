import React from 'react';

export default function History(props) {
    function onClick(e) {
        let index = props.history.indexOf(e.target.textContent);
        let arr = [...props.history];
        while(index > 0) {
            [arr[index],arr[index-1]]=[arr[index-1],arr[index]];
            --index;
        }
        props.setHistory(arr);
    }

    return (
        <ul id="location_history" className="list-group location-history">
            {
                props.history.map((value, i) =>
                    <li key={i} className="list-group-item" onClick={onClick}>{value}</li>
                )
            }
        </ul>
    );
}