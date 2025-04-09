import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

const UploadIconForm = (props: {next: () => void}) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasExistingIcon, setHasExistingIcon] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchIcon = async () => {
    try {
      setLoading(true);
      const res = await api.get('/member/icon', {
        responseType: 'blob', // for image blob
      });
      setLoading(false);

      if (res.data && res.data.size > 0) {
        const url = URL.createObjectURL(res.data);
        setPreviewUrl(url);
        setHasExistingIcon(true);
      }
    } catch (err) {
      console.error('Error fetching icon:', err);
    }
  };
  useEffect(() => {fetchIcon()}, []);

  const handleUpload = async () => {
    if (!image) return;
    const formData = new FormData();
    formData.append('file', image);

    try {
      setLoading(true);
      const res = await api.put('/member/icon', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setLoading(false);

      if (res.status === 200) {
        console.log('Uploaded:', res.data);
        setHasExistingIcon(true);
      } else {
        console.error('Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setHasExistingIcon(false);
    } else {
      setImage(null);
      setPreviewUrl(null);
    }
  };

  const next = async () => {
    if (image) {
      await handleUpload();
      props.next();
    } else {
      props.next();
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl flex flex-row items-center justify-center gap-2">
          Step 1: 上傳大頭照
        </CardTitle>
        <CardDescription>{hasExistingIcon ? '已上傳的照片如下，可選擇更換' : '請選擇一張清晰的大頭照'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex gap-2">
            <Label htmlFor="icon-upload" className='w-1/4'>選擇圖片</Label>
            <Input
              id="icon-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          {previewUrl && (
            <div className="flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="rounded-sm w-2/3 max-h-[300px] object-cover border shadow"
              />
            </div>
          )}
          <Button onClick={next} disabled={(!image && !hasExistingIcon) || loading}>
            {
              loading ? <Spinner className='text-[black]' size={"small"}/> : "下一步"
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadIconForm;
