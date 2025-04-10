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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { nextStep } from '@/redux/memberHomeSlice';

const UploadIconForm = () => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasExistingIcon, setHasExistingIcon] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const queryClient = useQueryClient();
  const token = useSelector<RootState>(state => state.auth?.token);
  const dispatch = useDispatch();

  const icon = useQuery({
    queryKey: ['icon', token],
    queryFn: () => {
      return api.get('/member/icon', {
        responseType: 'blob', // for image blob
      });
    },
    retry: false // to prevent retry on res.status === 404
  })

  useEffect(() => {
    if (icon.status === 'success' && icon.data && icon.data.data.size > 0) {
      const url = URL.createObjectURL(icon.data.data);
      setPreviewUrl(url);
      setHasExistingIcon(true);
    } else if (icon.status === 'error') {
      console.error('Error fetching icon:', icon.error);
    }
  }, [icon.data, icon.status])

  const upload = useMutation({
    mutationFn: (image: File | null) => {
      if (!image) return Promise.reject('請選擇圖片');
      const formData = new FormData();
      formData.append('file', image);
      return api.put('/member/icon', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: (res) => {
      if (res.status === 200) {
        setHasExistingIcon(true);
        dispatch(nextStep());
        queryClient.invalidateQueries({ queryKey: ['icon', token] })
      }
    },
    onError: (err: AxiosError<{error: string}> | string) => {
      if (typeof err === 'string') {
        setErrorMessage('請選擇圖片');
        return;
      }
      if (err.status === 413) {
        setErrorMessage('圖片太大了(☉д⊙) 請上傳<10MB的圖片')
      } else {
        setErrorMessage('上傳圖片失敗(☉д⊙) :' +err.response?.data?.error)
      }
    }
  })

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

  const handleNext = () => {
    if (!hasExistingIcon || image) {
      upload.mutate(image)
    } else if (hasExistingIcon && !image) {
      dispatch(nextStep());
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
          <Button onClick={handleNext} disabled={(!image && !hasExistingIcon) || icon.isLoading || upload.isPending}>
            {
              !icon.isLoading && !upload.isPending && "下一步"
            }
            {
              icon.isLoading && (
                <div className='flex gap-2'>
                  <Spinner className='text-[black]' size={"small"}/> 
                  載入大頭照中
                </div>
              )
            }
            {
              upload.isPending && <Spinner className='text-[black]' size={"small"}/> 
            }
          </Button>
          {upload.error && errorMessage && <p className="text-sm text-destructive text-center">{errorMessage}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadIconForm;
