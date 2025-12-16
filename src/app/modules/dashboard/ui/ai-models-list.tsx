"use client";

import { useEffect, useState } from "react";

const ModelList = () => {
    const [models, setModels] = useState<string[]>([]);

    useEffect(() => {
        fetch("/api/models")
            .then(res => res.json())
            .then(setModels);
    }, []);

    return (
        <ul>
            {models.map(model => (
                <li key={model}>{model}</li>
            ))}
        </ul>
    );
};

export default ModelList;
