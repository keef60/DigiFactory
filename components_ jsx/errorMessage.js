const ErrorMessage = ({ error }) => {

  const [clear,setClear] = useState(true); 
  useEffect(() => {
   
  }, [clear,error]);
 $('.close').on('click', function () {
      $(this)
        .closest('.message')
        .transition('fade');
        setClear(false)
    });
  const line = () => {
    return (error ? <p>{error.toString()}</p> :'')
  }

  return (

    !clear && <div class="ui negative message mini" style={{marginTop:'5%'}}>
      <i class="close icon"></i>
      <div class="header">
        Error
      </div>
      {line()}
    </div>
  )
}
