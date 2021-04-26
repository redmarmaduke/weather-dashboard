import React, { useRef } from 'react';

export default function SearchInput(props) {
    const searchInput = useRef(props.value || "");
    const setState = props.setState || (() => undefined);

    function onClick() {
        setState(searchInput.current.value);
        searchInput.current.value = props.value || "";
    }

    function onSubmit(event) {
        event.preventDefault();
        setState(searchInput.current.value);
        searchInput.current.value = props.value || "";
    }

    return (
        <form className="input-group location-history" onSubmit={onSubmit}>
            <input ref={searchInput} id="input_location" type="text" className="form-control" placeholder="Location" />
            <button id="submit_location" type="button" className="btn btn-default bg-primary input-group-append" onClick={onClick}>
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className="img-fluid" width="25px"
                    height="25px" viewBox="0 0 172 172" style={{ fill: "#000000" }}>
                    <g fill="none" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt"
                        strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0"
                        fontFamily="none" fontSize="none" style={{ mixBlendMode: "normal" }}>
                        <path d="M0,172v-172h172v172z" fill="none"></path>
                        <g id="original-icon" fill="#ffffff">
                            <path d="M72.24,10.32c-32.33062,0 -58.48,26.14938 -58.48,58.48c0,32.33063 26.14938,58.48 58.48,58.48c11.54281,0 22.22563,-3.38625 31.2825,-9.1375l42.2475,42.2475l14.62,-14.62l-41.71,-41.6025c7.49813,-9.83625 12.04,-22.02406 12.04,-35.3675c0,-32.33062 -26.14937,-58.48 -58.48,-58.48zM72.24,24.08c24.76531,0 44.72,19.95469 44.72,44.72c0,24.76531 -19.95469,44.72 -44.72,44.72c-24.76531,0 -44.72,-19.95469 -44.72,-44.72c0,-24.76531 19.95469,-44.72 44.72,-44.72z">
                            </path>
                        </g>
                    </g>
                </svg>
            </button>
        </form>
    );
}