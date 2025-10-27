const { useEffect } = React

const MiniSearch = ({
    inventoryRef,
    placeholder,
    searchThisClass,
    showMiniSearchOnlyBool,
    setSearchQuery,
    searchThisData
}) => {

    useEffect(() => {

        if (showMiniSearchOnlyBool) {
            $(`.ui.search.${searchThisClass}`)
            .search({
                onSearchQuery: (r => {
                    setSearchQuery(r);
                    console.log('onSearchQuery: ',r)
                })
            });
        }
    }, [inventoryRef])

    const field = () => {
        return (
            <div class='field'>
                <div class={`ui search  ${searchThisClass} ${!inventoryRef ? `loading disabled ` : ''}`} >
                    <div class="ui icon input">
                        <input class="prompt" type="text" placeholder={placeholder} />
                        <i class="search icon"></i>
                    </div>
                    <div class="results"></div>
                </div>
            </div>
        );
    };

    const miniSearch = () => {
        return (
            <div className="item">
                <div class={`ui right aligned search item  ${searchThisClass} ${!inventoryRef ? `loading disabled ` : ''}`} >
                    <div className="ui transparent icon input">
                        <input className="prompt" type="text" placeholder="Search..." />
                        <i className="search link icon"></i>
                    </div>
                    <div class="results"></div>
                </div>
            </div>
        );
    };

    return (
        showMiniSearchOnlyBool ? miniSearch() : field()
    )
}
