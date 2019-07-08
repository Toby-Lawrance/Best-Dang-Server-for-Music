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

class YTUpload extends React.Component
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
    .then(response => response.json())
    .then(json => {
      console.log("Got: " + JSON.stringify(json));
  });

  }

  render()
  {
    return (
    <form id="uploadYTform" onSubmit={this.handleSubmit}>
      <div className="ytUrl">
        <label className="title">URL:</label>
        <input type="text" name="url" id="urlInp" />
      </div>
      <div className="btn">
        <input type="submit" id="submitBtn" value="Submit" />
      </div>
    </form>
  );
  }
}

class FileUpload extends React.Component
{
  constructor(props)
  {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event)
  {

  }

  render()
  {
    return (
    <form id="uploadFileform" onSubmit={this.handleSubmit}>
      <div className="fUpload">
        <label className="file:">FILE:</label>
        <input type="file" name="file" id="fileInp" />
      </div>
      <div className="btn">
        <input type="submit" id="submitBtn" value="Submit" />
      </div>
    </form>
  );
  }
}

class Upload extends React.Component
{

  constructor(props)
  {
    super(props);
    this.state = {devBox1:"",ytShow:"inline",fShow:"none"}
    this.swapTab = this.swapTab.bind(this);
  }

  swapTab = (val) => {
    switch(val) {
      case 0: this.setState({ytShow:"inline",fShow:"none"});
              break;
      case 1: this.setState({ytShow:"none",fShow:"inline"});
              break;
    }
  }

  render() {
    return (
      <div className="UploadBox">
        <div className="tabs">
          <a className="tab" onClick={() => this.swapTab(0)} >YT</a>
          <a className="tab" onClick={() => this.swapTab(1)} >File</a>
        </div>
        <div className="devBox">
          <label>{this.state.devBox1}</label>
        </div>
        <div className="ytdBox" style={{display:this.state.ytShow}}>
          <YTUpload />
        </div>
        <div className="fileBox" style={{display:this.state.fShow}}>
          <FileUpload />
        </div>
      </div>
    );
  }
}
class Display extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {numBuckets:10};
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
