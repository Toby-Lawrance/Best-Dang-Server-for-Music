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
  render() {
    return (
      <div className="UploadBox">
        UploadBox
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
