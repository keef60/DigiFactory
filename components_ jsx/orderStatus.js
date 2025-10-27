const OrderStatus = ({ progress, goal }) => {
    // Step status logic
    const getStepStatus = (progress, goal) => {
        if (progress > 0 && progress < goal) return 'wip';
        if (progress - goal === 0) return 'completed';
    };

    // Steps at the Bottom - UI Ordered Steps
    const steps = () => {
        return (
            <div className="ui">
                <div className="ui ordered steps mini ">

                    <div className={`step ${storedGoalData?.isActive ? 'active' : 'disabled'}`}>
                        <div className="content">
                            <div className="title">Ordered</div>
                            <div className="description">Order initiated</div>
                        </div>
                    </div>

                    <div className={`step ${getStepStatus(storedGoalData?.progress > 0 ? storedGoalData?.progress : progress, storedGoalData?.goal) === 'wip' ? 'active' : 'disabled'}`}>
                        <div className="content">
                            <div className="title">WIP</div>
                            <div className="description">Work in progress</div>
                        </div>
                    </div>

                    <div className={`step ${getStepStatus(storedGoalData?.progress, storedGoalData?.goal) === 'completed' ? 'completed' : 'disabled'}`}>
                        <div className="content">
                            <div className="title">Completed</div>
                            <div className="description">Order is complete</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        steps()
    )
}
