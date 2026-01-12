import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from './ui/badge'

const AvatarDemo = () => {
  return (
    <>
    <Avatar>
      <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png' alt='Hallie Richards' />
      <AvatarFallback className='text-xs'>HR</AvatarFallback>
    </Avatar>
    <Badge variant='outline'>New</Badge>
    </>
  )
}

export default AvatarDemo
