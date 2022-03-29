import React from "react";

function useUpload(fname: string, data: any, ftype: string) {
  const [upload, setUpload] = React.useState<any>({});
  const [error, setError] = React.useState<any>("");
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const getFile = async () => {
      const read = new FileReader();
      read.readAsArrayBuffer(data);
      read.onload = async () => {
        const buffer = read.result;
        setUpload(buffer);
        setLoading(false);
      };
    };
    getFile();
  }, [data]);

  return { upload, error, loading };
}

export default useUpload;
