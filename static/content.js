class Bucket extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {bucketNum: props.value}
  }

  render() {
    return (
      <div className="Bucket">
        Bucket {this.state.bucketNum}
      </div>
    );
  }
}

class Upload extends React.Component
{

  constructor(props)
  {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }


  handleSubmit(event)
  {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(event.target));
    console.log("Sending: " + JSON.stringify(data));
    console.log(data);
    fetch('/ytd', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
           'Content-Type': 'application/json',
       },
    })
    .then(response => console.log(response));

  }

  render() {
    return (
      <div className="UploadBox">
        <form id="uploadYTform" onSubmit={this.handleSubmit}>
          <div className="ytUrl">
            <label className="title">URL:</label>
            <input type="text" name="url" id="urlInp" />
          </div>
          <div className="btn">
            <input type="submit" id="submitBtn" value="Submit" />
          </div>
        </form>
      </div>
    );
  }
}
class Display extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {numBuckets:5};
  }

  render ()
  {
    var buckets = [];
    for(var i = 0; i < this.state.numBuckets; i++)
    {
      buckets.push(<Bucket key={i} value={i} />);
    }
    return (
        <div className="MainSection">
          <Upload />
          Hello World! The React component works
          {buckets}
        </div>
      );
  }
}

ReactDOM.render(
  <Display />,
  document.getElementById('root')
);
