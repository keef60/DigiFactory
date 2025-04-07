const ErrorMessage = ({ error }) => {

  const [clear,setClear] = useState(true); 
  useEffect(() => {
    $('.close').on('click', function () {
      $(this)
        .closest('.message')
        .transition('fade');
        setClear(false)
    });
  }, [clear]);
  console.log(' ErrorMessage Component =========================>', error);
  const line = () => {
    return (error ? <p>{error.toString()}</p> :'')
  }

  return (

    error && <div class="ui negative message huge" style={{margin:'10%'}}>
      <i class="close icon"></i>
      <div class="header">
        Error
      </div>
      {line()}
    </div>
  )
}