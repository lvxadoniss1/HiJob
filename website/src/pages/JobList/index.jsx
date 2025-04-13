import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import 'jstree/dist/themes/default/style.css';
import 'jstree';
import jobApi from '../../services/apis/jobApi';

// Dữ liệu cây jsTree
const treeData = [
    {
        text: "Levels",
        state: { opened: true },
        children: [
            { text: "Junior", id: "junior", key: 1 },
            { text: "Mid", id: "mid", key: 2 },
            { text: "Senior", id: "senior", key: 3 },
            { text: "Lead", id: "lead", key: 4 },
        ]
    },
    {
        text: "Skills",
        state: { opened: true },
        children: [
            { text: "PHP", id: "php", key: 1 },
            { text: "React", id: "react", key: 2 },
            { text: "Java", id: "java", key: 3 },
            { text: "Python", id: "python", key: 4 },
        ]
    }
];

// Ô tìm kiếm
const JobSearch = ({ setSearchQuery }) => (
    <div className="mb-4 w-full text-center">
        <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-3 w-4/5 max-w-md border border-gray-300 rounded-lg"
        />
    </div>
);

// Item công việc
const JobItem = ({ job }) => (
    <div className="p-4 border border-gray-300 rounded-lg shadow-md bg-white">
        <h3 className="text-xl font-semibold text-blue-800">{job.title}</h3>
        <p className="text-gray-700 font-medium">{job.company}</p>
        <p className="text-gray-500">{job.location}</p>
        <p className="mt-2 text-gray-600">{job.description}</p>
        <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700">
            Apply
        </button>
    </div>
);

// Cây jsTree
const JsTreeComponent = ({ onNodeSelect }) => {
    useEffect(() => {
        $('#jstree').jstree({
            core: {
                data: treeData
            }
        });

        // Bắt sự kiện chọn node
        $('#jstree').on("select_node.jstree", function (e, data) {
            const selectedNodeId = data.node.id;
            onNodeSelect(selectedNodeId);
        });

        return () => {
            $('#jstree').off("select_node.jstree");
            $('#jstree').jstree("destroy").empty();
        };
    }, []);

    return <div id="jstree" className="mb-8 w-64 bg-white p-4 border rounded-lg shadow-sm" />;
};

// Danh sách công việc
const JobList = ({ searchQuery, filterKey, refreshSignal }) => {
    const [sjobs, setJobs] = useState(undefined);

    const fetchData = async () => {
        try {
            const response = await jobApi.getFilterJob({});
            setJobs(response.data);
        } catch (error) {
            console.log("Failed to fetch job:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refreshSignal]);

    const filteredJobs = sjobs?.filter((job) => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTree = filterKey ? job.title.toLowerCase().includes(filterKey.toLowerCase()) : true;
        return matchesSearch && matchesTree;
    }) || [];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full px-4">
            {sjobs === undefined ? (
                <p className="text-center text-gray-500 col-span-full">Đang tải dữ liệu...</p>
            ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job) => <JobItem key={job.id} job={job} />)
            ) : (
                <p className="text-center text-gray-500 col-span-full">Không có công việc phù hợp.</p>
            )}
        </div>
    );
};

// Component chính (JobsList)
export default function JobsList() {
    const [isTreeVisible, setIsTreeVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [treeFilterKey, setTreeFilterKey] = useState('');
    const [refreshSignal, setRefreshSignal] = useState(0); // tăng lên để kích hoạt useEffect

    const handleNodeSelect = (key) => {
        setTreeFilterKey(key);
    };

    const handleRefresh = () => {
        // reset search + filter + tăng signal để trigger useEffect
        setSearchQuery('');
        setTreeFilterKey('');
        setRefreshSignal((prev) => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
            <h1 className="text-3xl font-bold mb-6">Danh sách việc làm</h1>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setIsTreeVisible(!isTreeVisible)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
                >
                    {isTreeVisible ? 'Ẩn Menu Việc Làm' : 'Hiện Menu Việc Làm'}
                </button>

                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                    Làm mới dữ liệu
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 w-full justify-center">
                {isTreeVisible && <JsTreeComponent onNodeSelect={handleNodeSelect} />}
                <div className="flex-1">
                    <JobSearch setSearchQuery={setSearchQuery} />
                    <JobList searchQuery={searchQuery} filterKey={treeFilterKey} refreshSignal={refreshSignal} />
                </div>
            </div>
        </div>
    );
}
